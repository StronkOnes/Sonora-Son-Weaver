/**
 * SONORA SongWeaver - Standard MIDI File (SMF) Binary Writer
 * Generates Standard MIDI File Type 1 binary data.
 */

import { MidiNote, Track, Clip, SongProject, Section } from '../../types/music';

class ByteWriter {
  private buffer: number[] = [];

  writeByte(val: number): void {
    this.buffer.push(val & 0xff);
  }

  writeUint16(val: number): void {
    this.buffer.push((val >> 8) & 0xff);
    this.buffer.push(val & 0xff);
  }

  writeUint32(val: number): void {
    this.buffer.push((val >> 24) & 0xff);
    this.buffer.push((val >> 16) & 0xff);
    this.buffer.push((val >> 8) & 0xff);
    this.buffer.push(val & 0xff);
  }

  writeString(str: string): void {
    for (let i = 0; i < str.length; i++) {
      this.buffer.push(str.charCodeAt(i) & 0xff);
    }
  }

  writeVarLength(val: number): void {
    const buffer: number[] = [];
    let v = val;
    buffer.push(v & 0x7f);
    while ((v >>= 7) > 0) {
      buffer.push((v & 0x7f) | 0x80);
    }
    for (let i = buffer.length - 1; i >= 0; i--) {
      this.buffer.push(buffer[i]);
    }
  }

  writeBytes(bytes: number[] | Uint8Array): void {
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

interface RawMidiEvent {
  tick: number;
  type: 'note-on' | 'note-off';
  pitch: number;
  velocity: number;
  channel: number;
}

/**
 * Builds a track chunk with name and note events.
 */
function buildTrackChunk(
  trackName: string,
  events: RawMidiEvent[]
): Uint8Array {
  const content = new ByteWriter();

  // 1. Meta Event: Track Name (FF 03 len string)
  content.writeVarLength(0); // delta = 0
  content.writeByte(0xff);
  content.writeByte(0x03);
  content.writeVarLength(trackName.length);
  content.writeString(trackName);

  // 2. Sort note events by absolute tick.
  // When ticks match, Note Off comes before Note On to avoid note overlap stuck notes.
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type === 'note-off' && b.type === 'note-on') return -1;
    if (a.type === 'note-on' && b.type === 'note-off') return 1;
    return 0;
  });

  let lastTick = 0;
  for (const ev of events) {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;

    content.writeVarLength(delta);
    if (ev.type === 'note-on') {
      content.writeByte(0x90 | (ev.channel & 0x0f));
      content.writeByte(ev.pitch & 0x7f);
      content.writeByte(ev.velocity & 0x7f);
    } else {
      content.writeByte(0x80 | (ev.channel & 0x0f));
      content.writeByte(ev.pitch & 0x7f);
      content.writeByte(0x40); // default release velocity
    }
  }

  // 3. Meta Event: End of Track (FF 2F 00)
  content.writeVarLength(0);
  content.writeByte(0xff);
  content.writeByte(0x2f);
  content.writeByte(0x00);

  const trackData = content.toBytes();

  // Output "MTrk" + length + trackData
  const chunk = new ByteWriter();
  chunk.writeString('MTrk');
  chunk.writeUint32(trackData.length);
  chunk.writeBytes(trackData);

  return chunk.toBytes();
}

/**
 * Builds Tempo / Conductor track (Track 0)
 */
function buildTempoTrackChunk(bpm: number, timeSignature: [number, number]): Uint8Array {
  const content = new ByteWriter();

  // Sequence/Track Name
  content.writeVarLength(0);
  content.writeByte(0xff);
  content.writeByte(0x03);
  const name = 'SONORA SongWeaver Conductor';
  content.writeVarLength(name.length);
  content.writeString(name);

  // Time Signature: FF 58 04 nn dd cc bb
  content.writeVarLength(0);
  content.writeByte(0xff);
  content.writeByte(0x58);
  content.writeByte(0x04);
  content.writeByte(timeSignature[0]); // nn (numerator)
  const ddPower = Math.round(Math.log2(timeSignature[1]));
  content.writeByte(ddPower);          // dd (log2 of denominator)
  content.writeByte(24);               // cc (MIDI clocks in a metronome click)
  content.writeByte(8);                // bb (32nd notes per 24 MIDI clocks)

  // Set Tempo: FF 51 03 tt tt tt (microseconds per quarter note)
  const microsec = Math.round(60000000 / Math.max(20, bpm));
  content.writeVarLength(0);
  content.writeByte(0xff);
  content.writeByte(0x51);
  content.writeByte(0x03);
  content.writeByte((microsec >> 16) & 0xff);
  content.writeByte((microsec >> 8) & 0xff);
  content.writeByte(microsec & 0xff);

  // End of Track
  content.writeVarLength(0);
  content.writeByte(0xff);
  content.writeByte(0x2f);
  content.writeByte(0x00);

  const trackData = content.toBytes();

  const chunk = new ByteWriter();
  chunk.writeString('MTrk');
  chunk.writeUint32(trackData.length);
  chunk.writeBytes(trackData);

  return chunk.toBytes();
}

export interface ExportMidiOptions {
  mode: 'full' | 'single-track' | 'selected-section' | 'source-only';
  trackId?: string;
  sectionId?: string;
}

export function exportProjectToMidi(
  project: SongProject,
  options: ExportMidiOptions = { mode: 'full' }
): Uint8Array {
  const ppq = project.ppq || 480;
  const ticksPerBar = project.timeSignature[0] * ppq * (4 / project.timeSignature[1]);

  const trackChunks: Uint8Array[] = [];

  // Track 0: Tempo and meter
  trackChunks.push(buildTempoTrackChunk(project.tempo, project.timeSignature));

  // Determine clips to export
  let targetClips: Clip[] = [];

  if (options.mode === 'source-only') {
    targetClips = project.sourceClips.length > 0 ? project.sourceClips : project.clips;
  } else if (options.mode === 'selected-section' && options.sectionId) {
    const section = project.sections.find(s => s.id === options.sectionId);
    if (section) {
      const secStart = section.startBar;
      const secEnd = section.startBar + section.durationBars;
      // Get clips inside this section, clipped to relative 0 tick
      for (const clip of project.clips) {
        if (clip.startBar >= secStart && clip.startBar < secEnd) {
          // Adjust clip start relative to section start (bar 1)
          const relClip: Clip = {
            ...clip,
            startBar: clip.startBar - secStart + 1,
          };
          targetClips.push(relClip);
        }
      }
    }
  } else {
    // Full arrangement
    targetClips = project.clips;
  }

  // Filter by single track if requested
  const targetTracks = options.mode === 'single-track' && options.trackId
    ? project.tracks.filter(t => t.id === options.trackId)
    : project.tracks;

  for (const track of targetTracks) {
    const trackClips = targetClips.filter(c => c.trackId === track.id && !c.isMuted);
    const events: RawMidiEvent[] = [];

    for (const clip of trackClips) {
      const clipStartTick = (clip.startBar - 1) * ticksPerBar;

      for (const note of clip.notes) {
        const noteStart = clipStartTick + note.startTick;
        const noteEnd = noteStart + note.durationTick;

        events.push({
          tick: noteStart,
          type: 'note-on',
          pitch: note.pitch,
          velocity: note.velocity,
          channel: track.midiChannel,
        });

        events.push({
          tick: noteEnd,
          type: 'note-off',
          pitch: note.pitch,
          velocity: 64,
          channel: track.midiChannel,
        });
      }
    }

    if (events.length > 0 || options.mode === 'single-track') {
      const chunk = buildTrackChunk(track.name, events);
      trackChunks.push(chunk);
    }
  }

  // Header chunk: "MThd" (format 1, numTracks, ppq)
  const header = new ByteWriter();
  header.writeString('MThd');
  header.writeUint32(6);
  header.writeUint16(1); // Type 1: synchronous multiple tracks
  header.writeUint16(trackChunks.length);
  header.writeUint16(ppq);

  const totalBytes = new ByteWriter();
  totalBytes.writeBytes(header.toBytes());
  for (const tc of trackChunks) {
    totalBytes.writeBytes(tc);
  }

  return totalBytes.toBytes();
}

/**
 * Triggers a browser download of the exported MIDI file
 */
export function downloadMidiFile(data: Uint8Array, filename: string): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
