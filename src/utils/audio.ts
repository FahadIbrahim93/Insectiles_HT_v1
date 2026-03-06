export class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  bpm = 128;
  isPlaying = false;
  current16thNote = 0;
  total16thNotes = 0;
  nextNoteTime = 0.0;
  scheduleAheadTime = 0.1;
  lookahead = 25.0;
  timerID: number | null = null;
  startTime = 0;
  filterCutoff = 1000;
  filterSweepDir = 1;
  noiseBuffer: AudioBuffer | null = null;
  notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  laneNotes = [523.25, 659.25, 783.99, 1046.5];
  noteIndex = 0;
  muted = false;

  private static readonly ACID_NOTES = [174.61, 196.00, 233.08, 261.63, 311.13];
  private static readonly CHORDS = [
    [174.61, 207.65, 261.63], // Fm
    [155.56, 196.00, 233.08], // Eb
    [138.59, 164.81, 207.65], // Db
    [130.81, 164.81, 196.00], // C
  ];

  private getWindowRef(): (Window & typeof globalThis) | undefined {
    return typeof window !== "undefined" ? window : undefined;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.5;
    }
  }

  init() {
    if (this.ctx) return;
    const win = this.getWindowRef();
    const AudioContextCtor = win?.AudioContext ?? (win as Window & { webkitAudioContext?: typeof AudioContext } | undefined)?.webkitAudioContext;
    if (!AudioContextCtor) return;
    this.ctx = new AudioContextCtor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;

    const bufferSize = 2 * this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
  }

  private createSynth(time: number, freq: number, type: OscillatorType = 'sine', decay = 0.2, gainVal = 0.5) {
    if (!this.ctx || !this.masterGain) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + decay);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + decay);
    return { osc, gain };
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.current16thNote = (this.current16thNote + 1) % 16;
    this.total16thNotes += 1;
  }

  scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx || !this.masterGain) return;
    const bar = Math.floor(this.total16thNotes / 16);
    const barOfSection = bar % 8;
    const section = Math.floor(bar / 8) % 4;

    const isFmBar = beatNumber % 4 === 0;
    const isOffBeat = beatNumber % 4 !== 0;

    if (section === 0) {
      if (isFmBar) this.playKick(time);
      if (isOffBeat) this.playBass(time, section);
      if (beatNumber % 2 === 0) this.playHat(time, false);
      if (Math.random() > 0.8) this.playAcid(time, beatNumber, section);
    } else if (section === 1) {
      if (barOfSection < 4) {
        if (isFmBar) { this.playKick(time); this.playSnare(time); }
        if (isOffBeat) this.playBass(time, section);
      } else if (barOfSection < 6) {
        if (beatNumber % 2 === 0) { this.playKick(time); this.playSnare(time); }
      } else {
        this.playKick(time); this.playSnare(time);
      }
      if (Math.random() > 0.5) this.playAcid(time, beatNumber, section);
    } else if (section === 2) {
      if (isFmBar) this.playKick(time);
      if (isOffBeat) this.playBass(time, section);
      this.playHat(time, beatNumber % 4 === 2);
      if (beatNumber === 4 || beatNumber === 12) this.playSnare(time);
      if (Math.random() > 0.6) this.playAcid(time, beatNumber, section);
      if (beatNumber % 2 === 0) this.playArp(time, beatNumber, bar);
    } else if (section === 3) {
      this.playArp(time, beatNumber, bar);
      if (Math.random() > 0.4) this.playAcid(time, beatNumber, section);
      if (barOfSection === 7 && isFmBar) this.playSnare(time);
    }
  }

  playKick(time: number) {
    const synth = this.createSynth(time, 150, 'sine', 0.5, 1);
    if (synth) synth.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  }

  playBass(time: number, section: number) {
    if (!this.ctx || !this.masterGain) return;
    const freq = section === 2 ? 43.65 : 87.31;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.1);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.15);
  }

  playHat(time: number, isOpen: boolean) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 6000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.3 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + (isOpen ? 0.15 : 0.05));
    noise.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.2);
  }

  playSnare(time: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 2000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.2);
    this.createSynth(time, 250, 'triangle', 0.2, 0.4)?.osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
  }

  playAcid(time: number, beatNumber: number, section: number) {
    if (!this.ctx || !this.masterGain) return;
    const acidNote = AudioEngine.ACID_NOTES[beatNumber % AudioEngine.ACID_NOTES.length] ?? 261.63;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'square';
    osc.frequency.value = acidNote * (section === 2 ? 4 : 2);
    this.filterCutoff += (section === 1 ? 100 : 50) * this.filterSweepDir;
    if (this.filterCutoff > 4000) this.filterSweepDir = -1;
    if (this.filterCutoff < 300) this.filterSweepDir = 1;
    filter.type = 'lowpass'; filter.Q.value = 20;
    filter.frequency.setValueAtTime(this.filterCutoff, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + 0.2);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.2);
  }

  playArp(time: number, beatNumber: number, bar: number) {
    if (!this.ctx || !this.masterGain) return;
    const chord = AudioEngine.CHORDS[Math.floor(bar / 2) % 4];
    if (!chord) return;
    const freq = (chord[beatNumber % 3] ?? 261.63) * 2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + 0.2);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.2);
  }

  scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.nextNote();
    }
    const win = this.getWindowRef();
    this.timerID = (win?.setTimeout ?? globalThis.setTimeout)(() => this.scheduler(), this.lookahead) as unknown as number;
  }

  playBgm() {
    if (this.muted || !this.ctx || this.isPlaying) return;
    this.isPlaying = true;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.startTime = this.ctx.currentTime;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.current16thNote = 0;
    this.total16thNotes = 0;
    this.scheduler();
  }

  stopBgm() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      const win = this.getWindowRef();
      (win?.clearTimeout ?? globalThis.clearTimeout)(this.timerID);
      this.timerID = null;
    }
  }

  playTapSound(lane = 0, isFever = false) {
    if (this.muted || !this.ctx) return;
    if (isFever) {
      const synth = this.createSynth(this.ctx.currentTime, 880, 'sine', 0.2, 0.8);
      if (synth) synth.osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1);
    } else {
      const freq = this.laneNotes[Math.max(0, Math.min(this.laneNotes.length - 1, lane))] ?? this.notes[this.noteIndex % this.notes.length] ?? 261.63;
      this.noteIndex++;
      this.createSynth(this.ctx.currentTime, freq, 'triangle', 0.2, 0.5);
    }
  }

  playFeverActivation() {
    if (this.muted || !this.ctx) return;
    const synth = this.createSynth(this.ctx.currentTime, 110, 'sawtooth', 0.5, 1);
    if (synth) synth.osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.5);
  }

  playErrorSound() {
    if (this.muted || !this.ctx) return;
    const synth = this.createSynth(this.ctx.currentTime, 150, 'sawtooth', 0.3, 0.8);
    if (synth) synth.osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
  }
}
export const audio = new AudioEngine();
