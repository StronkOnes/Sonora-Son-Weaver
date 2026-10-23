/**
 * SONORA SongWeaver - High-Fidelity Multi-Timbral Synthesizer & Transport Engine
 * Powered by Web Audio API for offline, zero-dependency, real-time arrangement auditioning.
 */

import { MidiNote, SongProject, Track, TrackRole, Clip } from '../../types/music';

export type TransportState = 'stopped' | 'playing' | 'paused';

export interface TransportPosition {
  bar: number;      // 1-indexed
  beat: number;     // 1-indexed (1 to 4 in 4/4)
  sixteenth: number;// 1 to 4
  tick: number;     // absolute tick from start
  timeSeconds: number;
}

export class SonoraSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private trackGains: Map<string, GainNode> = new Map();
  private trackPanners: Map<string, StereoPannerNode> = new Map();

  // Transport state
  private state: TransportState = 'stopped';
  private currentProject: SongProject | null = null;
  private currentTick: number = 0;
  private startContextTime: number = 0;
  private startTickOffset: number = 0;
  private schedulerTimer: number | null = null;
  private lastScheduledTick: number = 0;
  private isMetronomeActive: boolean = false;
  private loopSectionId: string | null = null;
  private isSoloActive: boolean = false;

  // Listeners
  private onPositionUpdate?: (pos: TransportPosition) => void;
  private onStateChange?: (state: TransportState) => void;
  private onLevelUpdate?: (level: number) => void;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public setCallbacks(
    onPos: (pos: TransportPosition) => void,
    onState: (state: TransportState) => void,
    onLevel?: (level: number) => void
  ) {
    this.onPositionUpdate = onPos;
    this.onStateChange = onState;
    this.onLevelUpdate = onLevel;
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Limiter
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(6.0, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(12.0, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.1, this.ctx.currentTime);

      // Analyser Node for visual metering
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setProject(project: SongProject) {
    this.currentProject = project;
    this.initAudio();
    this.setupTrackNodes(project.tracks);
  }

  private setupTrackNodes(tracks: Track[]) {
    if (!this.ctx || !this.masterGain) return;

    this.isSoloActive = tracks.some(t => t.isSolo);

    for (const track of tracks) {
      if (!this.trackGains.has(track.id)) {
        const gain = this.ctx.createGain();
        let panner: StereoPannerNode | null = null;
        if (this.ctx.createStereoPanner) {
          panner = this.ctx.createStereoPanner();
          panner.pan.value = track.pan;
          gain.connect(panner);
          panner.connect(this.masterGain);
          this.trackPanners.set(track.id, panner);
        } else {
          gain.connect(this.masterGain);
        }
        this.trackGains.set(track.id, gain);
      }

      const gain = this.trackGains.get(track.id);
      if (gain) {
        let isAudible = !track.isMuted;
        if (this.isSoloActive) {
          isAudible = isAudible && track.isSolo;
        }
        const effectiveGain = isAudible ? track.volume : 0.0;
        gain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
      }
    }
  }

  public updateTrackState(trackId: string, isMuted: boolean, isSolo: boolean, volume: number, pan: number) {
    if (!this.ctx || !this.currentProject) return;

    // Recalculate solo state
    const track = this.currentProject.tracks.find(t => t.id === trackId);
    if (track) {
      track.isMuted = isMuted;
      track.isSolo = isSolo;
      track.volume = volume;
      track.pan = pan;
    }
    this.setupTrackNodes(this.currentProject.tracks);
  }

  public setMasterVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1.0, volume)), this.ctx.currentTime);
    }
  }

  public toggleMetronome(active?: boolean) {
    this.isMetronomeActive = active !== undefined ? active : !this.isMetronomeActive;
  }

  public setLoopSection(sectionId: string | null) {
    this.loopSectionId = sectionId;
  }

  public play() {
    this.initAudio();
    if (!this.ctx || !this.currentProject) return;

    if (this.state === 'playing') return;

    this.state = 'playing';
    this.startContextTime = this.ctx.currentTime;
    this.startTickOffset = this.currentTick;
    this.lastScheduledTick = this.currentTick;

    if (this.onStateChange) this.onStateChange('playing');

    this.startScheduler();
  }

  public pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.stopScheduler();
    if (this.onStateChange) this.onStateChange('paused');
  }

  public stop() {
    this.state = 'stopped';
    this.stopScheduler();
    this.currentTick = 0;
    this.lastScheduledTick = 0;
    if (this.onStateChange) this.onStateChange('stopped');
    this.reportPosition();
  }

  public seekToBar(bar: number) {
    if (!this.currentProject) return;
    const ppq = this.currentProject.ppq || 480;
    const ticksPerBar = this.currentProject.timeSignature[0] * ppq * (4 / this.currentProject.timeSignature[1]);
    const targetTick = Math.max(0, (bar - 1) * ticksPerBar);
    this.seekToTick(targetTick);
  }

  public seekToTick(targetTick: number) {
    this.currentTick = Math.max(0, targetTick);
    this.lastScheduledTick = this.currentTick;
    if (this.state === 'playing' && this.ctx) {
      this.startContextTime = this.ctx.currentTime;
      this.startTickOffset = this.currentTick;
    }
    this.reportPosition();
  }

  private startScheduler() {
    this.stopScheduler();
    // Schedule lookahead loop every 25ms
    this.schedulerTimer = window.setInterval(() => {
      this.onScheduleStep();
    }, 25);
  }

  private stopScheduler() {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private onScheduleStep() {
    if (!this.ctx || !this.currentProject || this.state !== 'playing') return;

    const ppq = this.currentProject.ppq || 480;
    const bpm = this.currentProject.tempo;
    const secPerBeat = 60 / bpm;
    const secPerTick = secPerBeat / ppq;

    const elapsedSec = this.ctx.currentTime - this.startContextTime;
    this.currentTick = this.startTickOffset + Math.round(elapsedSec / secPerTick);

    const ticksPerBar = this.currentProject.timeSignature[0] * ppq * (4 / this.currentProject.timeSignature[1]);
    const totalProjectTicks = this.currentProject.totalBars * ticksPerBar;

    // Check loop section boundary
    if (this.loopSectionId) {
      const section = this.currentProject.sections.find(s => s.id === this.loopSectionId);
      if (section) {
        const loopStartTick = (section.startBar - 1) * ticksPerBar;
        const loopEndTick = loopStartTick + section.durationBars * ticksPerBar;
        if (this.currentTick >= loopEndTick) {
          this.currentTick = loopStartTick;
          this.lastScheduledTick = loopStartTick;
          this.startContextTime = this.ctx.currentTime;
          this.startTickOffset = loopStartTick;
        }
      }
    } else if (this.currentTick >= totalProjectTicks) {
      // Loop entire song or stop
      this.currentTick = 0;
      this.lastScheduledTick = 0;
      this.startContextTime = this.ctx.currentTime;
      this.startTickOffset = 0;
    }

    // Schedule window: look ahead 150ms
    const lookaheadTicks = Math.round(0.15 / secPerTick);
    const windowStartTick = this.lastScheduledTick;
    const windowEndTick = this.currentTick + lookaheadTicks;

    this.scheduleNotesInRange(windowStartTick, windowEndTick, secPerTick);
    this.lastScheduledTick = windowEndTick;

    this.reportPosition();
    this.reportMeterLevel();
  }

  private scheduleNotesInRange(fromTick: number, toTick: number, secPerTick: number) {
    if (!this.ctx || !this.currentProject) return;

    const ppq = this.currentProject.ppq || 480;
    const ticksPerBar = this.currentProject.timeSignature[0] * ppq * (4 / this.currentProject.timeSignature[1]);
    const ticksPerBeat = ppq;

    // Metronome Click
    if (this.isMetronomeActive) {
      const startBeat = Math.floor(fromTick / ticksPerBeat);
      const endBeat = Math.floor(toTick / ticksPerBeat);
      for (let b = startBeat; b <= endBeat; b++) {
        const beatTick = b * ticksPerBeat;
        if (beatTick >= fromTick && beatTick < toTick) {
          const deltaTicks = beatTick - this.currentTick;
          const scheduleTime = this.ctx.currentTime + deltaTicks * secPerTick;
          const isDownbeat = (b % this.currentProject.timeSignature[0]) === 0;
          this.playMetronomeClick(scheduleTime, isDownbeat);
        }
      }
    }

    // Identify which section each bar belongs to, checking section trackActivity
    for (const track of this.currentProject.tracks) {
      // Check if track is globally muted or soloed out
      let isTrackAudible = !track.isMuted;
      if (this.isSoloActive) {
        isTrackAudible = isTrackAudible && track.isSolo;
      }
      if (!isTrackAudible) continue;

      const trackNode = this.trackGains.get(track.id) || this.masterGain;
      if (!trackNode) continue;

      // Find clips on this track
      const clips = this.currentProject.clips.filter(c => c.trackId === track.id && !c.isMuted);

      for (const clip of clips) {
        const clipStartTick = (clip.startBar - 1) * ticksPerBar;
        const clipEndTick = clipStartTick + clip.durationBars * ticksPerBar;

        if (clipEndTick < fromTick || clipStartTick > toTick) continue;

        // Check if section mutes this track
        const sectionForClip = this.currentProject.sections.find(
          s => clip.startBar >= s.startBar && clip.startBar < s.startBar + s.durationBars
        );
        if (sectionForClip && sectionForClip.trackActivity[track.id] === false) {
          // Track is muted in this section
          continue;
        }

        for (const note of clip.notes) {
          const noteStartTick = clipStartTick + note.startTick;
          if (noteStartTick >= fromTick && noteStartTick < toTick) {
            const deltaTicks = noteStartTick - this.currentTick;
            const scheduleTime = Math.max(this.ctx.currentTime, this.ctx.currentTime + deltaTicks * secPerTick);
            const durationSec = Math.max(0.04, note.durationTick * secPerTick);

            this.synthesizeNote(track.role, note.pitch, note.velocity, scheduleTime, durationSec, trackNode);
          }
        }
      }
    }
  }

  /**
   * Sound Synthesis Engine for different musical roles
   */
  private synthesizeNote(
    role: TrackRole,
    pitch: number,
    velocity: number,
    time: number,
    duration: number,
    destNode: AudioNode
  ) {
    if (!this.ctx) return;

    const vel = Math.max(0.1, velocity / 127);
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);

    switch (role) {
      case 'drums':
        this.synthesizeDrumSound(pitch, vel, time, destNode);
        break;

      case 'log-drum':
        this.synthesizeLogDrum(pitch, vel, time, destNode);
        break;

      case 'bass':
        this.synthesizeBass(freq, vel, time, duration, destNode);
        break;

      case 'chords':
        this.synthesizeElectricKeys(freq, vel, time, duration, destNode);
        break;

      case 'melody':
        this.synthesizeLeadSynth(freq, vel, time, duration, destNode);
        break;

      case 'texture':
        this.synthesizeAmbientPad(freq, vel, time, duration, destNode);
        break;

      default:
        this.synthesizeLeadSynth(freq, vel, time, duration, destNode);
        break;
    }
  }

  // 1. Drum Synth (General MIDI mapping or key ranges)
  private synthesizeDrumSound(pitch: number, vel: number, time: number, dest: AudioNode) {
    if (!this.ctx) return;

    // Kick: 35, 36, or pitch < 40
    if (pitch === 35 || pitch === 36 || pitch <= 40) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      // Pitch drop: punchy kick transient
      osc.frequency.setValueAtTime(145, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

      gain.gain.setValueAtTime(1.0 * vel, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.35);
    }
    // Snare / Rimshot: 38, 40
    else if (pitch === 38 || pitch === 40 || pitch === 37) {
      // Body oscillator
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, time);
      osc.frequency.exponentialRampToValueAtTime(110, time + 0.06);
      oscGain.gain.setValueAtTime(0.6 * vel, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.16);

      // Noise burst for snare snap
      this.playFilteredNoise(time, 0.18, 1200, 3.0, 0.7 * vel, dest);
    }
    // Hi-Hats: 42 (closed), 44 (pedal), 46 (open)
    else if (pitch === 42 || pitch === 44 || pitch === 46) {
      const isOpen = pitch === 46;
      const decay = isOpen ? 0.28 : 0.045;
      this.playFilteredNoise(time, decay, 7500, 1.5, 0.38 * vel, dest, 'highpass');
    }
    // Toms / Percussion
    else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const baseFreq = 90 + ((pitch % 12) * 15);
      osc.frequency.setValueAtTime(baseFreq * 1.5, time);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.07);

      gain.gain.setValueAtTime(0.7 * vel, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.25);
    }
  }

  // 2. Amapiano Log Drum: Resonant pitched wooden click + deep sine body with sub-bass drop
  private synthesizeLogDrum(pitch: number, vel: number, time: number, dest: AudioNode) {
    if (!this.ctx) return;

    const baseFreq = 440 * Math.pow(2, (pitch - 69) / 12);
    const targetFreq = Math.max(38, Math.min(160, baseFreq));

    // Sub oscillator (Triangle/Sine)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Characteristic resonant log-drum envelope
    osc.frequency.setValueAtTime(targetFreq * 2.2, time);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.05);

    // Warm punch envelope
    gain.gain.setValueAtTime(0.95 * vel, time);
    gain.gain.linearRampToValueAtTime(0.7 * vel, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    // Wood knock transient
    const knock = this.ctx.createOscillator();
    const knockGain = this.ctx.createGain();
    knock.type = 'square';
    knock.frequency.setValueAtTime(450, time);
    knock.frequency.exponentialRampToValueAtTime(120, time + 0.02);
    knockGain.gain.setValueAtTime(0.4 * vel, time);
    knockGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    knock.connect(knockGain);
    knockGain.connect(dest);
    knock.start(time);
    knock.stop(time + 0.04);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.48);
  }

  // 3. Bass Synth: Deep warm filtered saw/sub
  private synthesizeBass(freq: number, vel: number, time: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq / 2, time); // sub octave

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 3.5, 900), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 1.2), time + duration);
    filter.Q.setValueAtTime(3.5, time);

    const safeDuration = Math.max(0.08, duration);
    gain.gain.setValueAtTime(0.85 * vel, time);
    gain.gain.linearRampToValueAtTime(0.65 * vel, time + 0.04);
    gain.gain.setValueAtTime(0.65 * vel, time + safeDuration - 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + safeDuration + 0.06);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + safeDuration + 0.07);
    osc2.stop(time + safeDuration + 0.07);
  }

  // 4. Electric Keys / Rhodes style chords
  private synthesizeElectricKeys(freq: number, vel: number, time: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.01, time); // bell overtone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.0, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.4, time + Math.min(duration, 0.4));

    const safeDuration = Math.max(0.1, duration);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.7 * vel, time + 0.012); // smooth attack
    gain.gain.exponentialRampToValueAtTime(0.35 * vel, time + Math.min(0.2, safeDuration));
    gain.gain.setValueAtTime(0.35 * vel, time + safeDuration - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + safeDuration + 0.12);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + safeDuration + 0.15);
    osc2.stop(time + safeDuration + 0.15);
  }

  // 5. Lead Synth: Crisp cutting melody lead
  private synthesizeLeadSynth(freq: number, vel: number, time: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 4.0, 4500), time);
    filter.Q.setValueAtTime(2.0, time);

    const safeDuration = Math.max(0.08, duration);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.75 * vel, time + 0.015);
    gain.gain.setValueAtTime(0.65 * vel, time + safeDuration - 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + safeDuration + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + safeDuration + 0.1);
  }

  // 6. Ambient Pad: Lush slow attack with soft filter
  private synthesizeAmbientPad(freq: number, vel: number, time: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq * 0.998, time); // detune
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 2.2, 1800), time);

    const safeDuration = Math.max(0.2, duration);
    const attack = 0.08;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.55 * vel, time + attack);
    gain.gain.setValueAtTime(0.55 * vel, time + safeDuration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + safeDuration + 0.25);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + safeDuration + 0.3);
    osc2.stop(time + safeDuration + 0.3);
  }

  private playMetronomeClick(time: number, isDownbeat: boolean) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 1400 : 900, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  private playFilteredNoise(
    time: number,
    duration: number,
    filterFreq: number,
    q: number,
    gainLevel: number,
    dest: AudioNode,
    filterType: BiquadFilterType = 'bandpass'
  ) {
    if (!this.ctx) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.Q.setValueAtTime(q, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(time);
    whiteNoise.stop(time + duration);
  }

  private reportPosition() {
    if (!this.onPositionUpdate || !this.currentProject) return;

    const ppq = this.currentProject.ppq || 480;
    const ticksPerBeat = ppq;
    const beatsPerBar = this.currentProject.timeSignature[0];
    const ticksPerBar = beatsPerBar * ticksPerBeat * (4 / this.currentProject.timeSignature[1]);

    const bar = Math.floor(this.currentTick / ticksPerBar) + 1;
    const remainderTick = this.currentTick % ticksPerBar;
    const beat = Math.floor(remainderTick / ticksPerBeat) + 1;
    const sixteenthTick = ticksPerBeat / 4;
    const sixteenth = Math.floor((remainderTick % ticksPerBeat) / sixteenthTick) + 1;

    const secPerBeat = 60 / this.currentProject.tempo;
    const secPerTick = secPerBeat / ppq;
    const timeSeconds = this.currentTick * secPerTick;

    this.onPositionUpdate({
      bar,
      beat,
      sixteenth,
      tick: this.currentTick,
      timeSeconds,
    });
  }

  private reportMeterLevel() {
    if (!this.onLevelUpdate || !this.analyser) return;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const val = (data[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / data.length);
    this.onLevelUpdate(Math.min(1.0, rms * 3.5));
  }

  public destroy() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
  }
}

// Global singleton synth instance for app-wide transport
export const globalSynth = new SonoraSynthEngine();
