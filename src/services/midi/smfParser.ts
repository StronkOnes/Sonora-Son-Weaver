/**
 * SONORA SongWeaver - Standard MIDI File (SMF) Binary Parser
 * Supports Type 0 and Type 1 Standard MIDI Files.
 */

import { MidiNote, Track, Clip, TrackRole } from '../../types/music';

interface ParsedMidiTrack {
  name: string;
  channel: number;
  notes: MidiNote[];
}

export interface MidiParseResult {
  format: number;
  ppq: number;
  bpm: number;
  timeSignature: [number, number];
  tracks: Track[];
  clips: Clip[];
  totalBars: number;
}

class ByteReader {
  private view: DataView;
  public offset: number = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  get length(): number {
    return this.view.byteLength;
  }

  hasMore(): boolean {
    return this.offset < this.view.byteLength;
  }

  readUint8(): number {
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readUint16(): number {
    const val = this.view.getUint16(this.offset, false); // Big Endian
    this.offset += 2;
    return val;
  }

  readUint32(): number {
    const val = this.view.getUint32(this.offset, false); // Big Endian
    this.offset += 4;
    return val;
  }

  readString(length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(this.readUint8());
    }
    return str;
  }

  readBytes(length: number): Uint8Array {
    const arr = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;
    return new Uint8Array(arr); // copy
  }

  readVarLength(): number {
    let result = 0;
    while (this.offset < this.view.byteLength) {
      const byte = this.readUint8();
      result = (result << 7) | (byte & 0x7f);
      if ((byte & 0x80) === 0) {
        break;
      }
    }
    return result;
  }
}

/**
 * Detect musical role from track name or note register
 */
function inferRole(name: string, notes: MidiNote[], channel: number): TrackRole {
  const lower = name.toLowerCase();
  if (channel === 9 || lower.includes('drum') || lower.includes('perc') || lower.includes('beat') || lower.includes('kick')) {
    return 'drums';
  }
  if (lower.includes('log') || lower.includes('logdrum')) {
    return 'log-drum';
  }
  if (lower.includes('bass') || lower.includes('sub') || lower.includes('808')) {
    return 'bass';
  }
  if (lower.includes('chord') || lower.includes('key') || lower.includes('piano') || lower.includes('rhodes') || lower.includes('ep') || lower.includes('organ')) {
    return 'chords';
  }
  if (lower.includes('lead') || lower.includes('melody') || lower.includes('vocal') || lower.includes('flute') || lower.includes('sax') || lower.includes('synth')) {
    return 'melody';
  }
  if (lower.includes('pad') || lower.includes('texture') || lower.includes('atmos') || lower.includes('ambient') || lower.includes('string')) {
    return 'texture';
  }

  // Fallback to pitch analysis
  if (notes.length > 0) {
    const avgPitch = notes.reduce((acc, n) => acc + n.pitch, 0) / notes.length;
    if (avgPitch < 48) return 'bass';
    if (avgPitch > 70) return 'melody';
    return 'chords';
  }

  return 'unassigned';
}

const ROLE_COLORS: Record<TrackRole, string> = {
  'drums': '#ef4444',
  'bass': '#f59e0b',
  'log-drum': '#d97706',
  'chords': '#3b82f6',
  'melody': '#10b981',
  'texture': '#8b5cf6',
  'audio-reference': '#64748b',
  'unassigned': '#94a3b8'
};

export function parseStandardMidiFile(buffer: ArrayBuffer): MidiParseResult {
  const reader = new ByteReader(buffer);

  // Read Header Chunk: "MThd"
  const headerId = reader.readString(4);
  if (headerId !== 'MThd') {
    throw new Error(`Invalid MIDI file header: expected 'MThd', found '${headerId}'`);
  }

  const headerLength = reader.readUint32();
  if (headerLength < 6) {
    throw new Error(`Invalid MThd chunk length: ${headerLength}`);
  }

  const format = reader.readUint16();
  const numTracks = reader.readUint16();
  const division = reader.readUint16();

  // Division check: if division > 0x8000, it's SMPTE frame rate. For standard musical MIDI, it's PPQ (ticks per quarter note).
  let ppq = 480;
  if ((division & 0x8000) === 0) {
    ppq = division;
  }

  // Skip any extra header bytes
  if (headerLength > 6) {
    reader.readBytes(headerLength - 6);
  }

  let tempoBpm = 120;
  let timeSignature: [number, number] = [4, 4];
  const parsedTracks: ParsedMidiTrack[] = [];

  for (let t = 0; t < numTracks; t++) {
    if (!reader.hasMore()) break;

    const trackId = reader.readString(4);
    if (trackId !== 'MTrk') {
      // Skip unknown chunk
      const chunkSize = reader.readUint32();
      reader.readBytes(chunkSize);
      continue;
    }

    const trackLength = reader.readUint32();
    const trackEndOffset = reader.offset + trackLength;

    let trackName = `Track ${t + 1}`;
    let primaryChannel = 0;
    let currentTick = 0;
    let runningStatus = 0;

    const activeNotes = new Map<number, { pitch: number; startTick: number; velocity: number }>();
    const finishedNotes: MidiNote[] = [];

    while (reader.offset < trackEndOffset && reader.hasMore()) {
      const delta = reader.readVarLength();
      currentTick += delta;

      let statusByte = reader.readUint8();

      // Check for running status
      if ((statusByte & 0x80) === 0) {
        if (runningStatus === 0) {
          throw new Error('MIDI file has running status without preceding status byte');
        }
        reader.offset -= 1; // rewind 1 byte so parameter can be read
        statusByte = runningStatus;
      } else {
        runningStatus = statusByte;
      }

      // Meta event
      if (statusByte === 0xff) {
        const metaType = reader.readUint8();
        const metaLength = reader.readVarLength();

        if (metaType === 0x03) {
          // Track Name
          trackName = reader.readString(metaLength);
        } else if (metaType === 0x51 && metaLength === 3) {
          // Set Tempo (microseconds per quarter note)
          const b1 = reader.readUint8();
          const b2 = reader.readUint8();
          const b3 = reader.readUint8();
          const microsecPerBeat = (b1 << 16) | (b2 << 8) | b3;
          tempoBpm = Math.round(60000000 / microsecPerBeat);
        } else if (metaType === 0x58 && metaLength >= 2) {
          // Time Signature: nn, dd, cc, bb
          const nn = reader.readUint8();
          const ddPower = reader.readUint8();
          const dd = Math.pow(2, ddPower);
          timeSignature = [nn, dd];
          if (metaLength > 2) reader.readBytes(metaLength - 2);
        } else if (metaType === 0x2f) {
          // End of Track
          if (metaLength > 0) reader.readBytes(metaLength);
          break;
        } else {
          reader.readBytes(metaLength);
        }
        continue;
      }

      // Sysex events
      if (statusByte === 0xf0 || statusByte === 0xf7) {
        const sysexLength = reader.readVarLength();
        reader.readBytes(sysexLength);
        continue;
      }

      // Channel voice messages
      const messageType = statusByte & 0xf0;
      const channel = statusByte & 0x0f;
      primaryChannel = channel;

      if (messageType === 0x90) {
        // Note On
        const pitch = reader.readUint8();
        const velocity = reader.readUint8();

        if (velocity === 0) {
          // Note On with vel 0 is Note Off
          const noteKey = (channel << 8) | pitch;
          const pending = activeNotes.get(noteKey);
          if (pending) {
            finishedNotes.push({
              id: `note_${t}_${finishedNotes.length}`,
              pitch: pending.pitch,
              startTick: pending.startTick,
              durationTick: Math.max(24, currentTick - pending.startTick),
              velocity: pending.velocity,
            });
            activeNotes.delete(noteKey);
          }
        } else {
          const noteKey = (channel << 8) | pitch;
          // If already playing, close the existing one first
          const pending = activeNotes.get(noteKey);
          if (pending) {
            finishedNotes.push({
              id: `note_${t}_${finishedNotes.length}`,
              pitch: pending.pitch,
              startTick: pending.startTick,
              durationTick: Math.max(24, currentTick - pending.startTick),
              velocity: pending.velocity,
            });
          }
          activeNotes.set(noteKey, { pitch, startTick: currentTick, velocity });
        }
      } else if (messageType === 0x80) {
        // Note Off
        const pitch = reader.readUint8();
        reader.readUint8(); // velocity off
        const noteKey = (channel << 8) | pitch;
        const pending = activeNotes.get(noteKey);
        if (pending) {
          finishedNotes.push({
            id: `note_${t}_${finishedNotes.length}`,
            pitch: pending.pitch,
            startTick: pending.startTick,
            durationTick: Math.max(24, currentTick - pending.startTick),
            velocity: pending.velocity,
          });
          activeNotes.delete(noteKey);
        }
      } else if (messageType === 0xa0 || messageType === 0xb0 || messageType === 0xe0) {
        // Polyphonic aftertouch, Control change, Pitch bend (2 data bytes)
        reader.readUint8();
        reader.readUint8();
      } else if (messageType === 0xc0 || messageType === 0xd0) {
        // Program change, Channel pressure (1 data byte)
        reader.readUint8();
      }
    }

    // Flush any still open notes
    for (const [, pending] of activeNotes.entries()) {
      finishedNotes.push({
        id: `note_${t}_${finishedNotes.length}`,
        pitch: pending.pitch,
        startTick: pending.startTick,
        durationTick: ppq, // default 1 beat duration
        velocity: pending.velocity,
      });
    }

    // Ensure reading offset reaches the end of track chunk accurately
    reader.offset = Math.max(reader.offset, trackEndOffset);

    if (finishedNotes.length > 0 || trackName.toLowerCase() !== 'tempo track') {
      parsedTracks.push({
        name: trackName,
        channel: primaryChannel,
        notes: finishedNotes.sort((a, b) => a.startTick - b.startTick),
      });
    }
  }

  // Filter tracks to those with notes, or keep at least 1 track
  const tracksWithNotes = parsedTracks.filter(pt => pt.notes.length > 0);
  const activeParsedTracks = tracksWithNotes.length > 0 ? tracksWithNotes : parsedTracks;

  // Calculate ticks per bar (default: 4 beats * ppq in 4/4)
  const ticksPerBar = timeSignature[0] * ppq * (4 / timeSignature[1]);

  // Determine loop length in bars
  let maxTick = 0;
  for (const pt of activeParsedTracks) {
    for (const note of pt.notes) {
      const end = note.startTick + note.durationTick;
      if (end > maxTick) maxTick = end;
    }
  }
  const rawBars = maxTick / ticksPerBar;
  // Snap to standard 4, 8, 16, or next power of 2/bar
  let totalBars = Math.max(4, Math.ceil(rawBars));
  if (totalBars > 4 && totalBars <= 8) totalBars = 8;
  else if (totalBars > 8 && totalBars <= 16) totalBars = 16;

  // Build Project Track and Clip models
  const tracks: Track[] = [];
  const clips: Clip[] = [];

  activeParsedTracks.forEach((pt, index) => {
    const trackId = `track_${index + 1}`;
    const role = inferRole(pt.name, pt.notes, pt.channel);

    const track: Track = {
      id: trackId,
      name: pt.name || `Track ${index + 1} (${role.toUpperCase()})`,
      role,
      color: ROLE_COLORS[role] || '#94a3b8',
      isMuted: false,
      isSolo: false,
      volume: 0.8,
      pan: 0,
      midiChannel: pt.channel,
      isSource: true,
      notesCount: pt.notes.length,
    };
    tracks.push(track);

    const clip: Clip = {
      id: `clip_source_${trackId}`,
      trackId: trackId,
      name: `${track.name} [Original]`,
      startBar: 1,
      durationBars: totalBars,
      notes: pt.notes,
      origin: 'original',
    };
    clips.push(clip);
  });

  return {
    format,
    ppq,
    bpm: tempoBpm,
    timeSignature,
    tracks,
    clips,
    totalBars,
  };
}
