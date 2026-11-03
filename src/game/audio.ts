/**
 * Procedural Web Audio API Sound & Dynamic Music Engine
 * Zero external sound assets required; lightweight, responsive, and pitch-varied.
 */

class SoundEngine {
  public static readonly BOSS_BGM_URL = '/assets/aistudio/Final_Boss_Battle__Alt__44ddcd07.mp3';

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicRunning: boolean = false;
  private musicInterval: number | null = null;
  private currentMusicMode: 'ambient' | 'combat' | 'boss' | 'ending' | 'none' = 'none';
  private bossAudio: HTMLAudioElement | null = null;
  private isBossAudioPlaying: boolean = false;

  // Musical state
  private musicStep: number = 0;
  private hirajoshiScale = [146.83, 155.56, 196.0, 220.0, 233.08, 293.66, 311.13, 392.0]; // D Hirajoshi scale

  constructor() {
    // Will lazily init on first user input
  }

  private ensureBossAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    if (!this.bossAudio) {
      this.bossAudio = new Audio(SoundEngine.BOSS_BGM_URL);
      this.bossAudio.loop = true;
      this.bossAudio.preload = 'auto';
      this.bossAudio.volume = this.isMuted ? 0 : 0.65;
      this.bossAudio.muted = this.isMuted;
    }
    return this.bossAudio;
  }

  private initCtx(): boolean {
    if (!this.ctx) {
      if (typeof window === 'undefined') return false;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.value = 0.22;
      this.sfxGain.gain.value = 0.35;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // If in boss mode and bossAudio was blocked prior to user gesture, ensure it plays now
    if (this.currentMusicMode === 'boss' && this.bossAudio && this.bossAudio.paused && !this.isMuted) {
      this.bossAudio.play().then(() => {
        this.isBossAudioPlaying = true;
      }).catch(() => {
        // Ignore autoplay restriction until next interaction
      });
    }

    return true;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    if (this.bossAudio) {
      this.bossAudio.muted = this.isMuted;
      this.bossAudio.volume = this.isMuted ? 0 : 0.65;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    if (this.bossAudio) {
      this.bossAudio.muted = this.isMuted;
      this.bossAudio.volume = this.isMuted ? 0 : 0.65;
    }
  }

  public getMusicMode(): 'ambient' | 'combat' | 'boss' | 'ending' | 'none' {
    return this.currentMusicMode;
  }

  public getBossAudioInfo(): { src: string; paused: boolean; loop: boolean; volume: number } | null {
    if (!this.bossAudio) return null;
    return {
      src: this.bossAudio.src,
      paused: this.bossAudio.paused,
      loop: this.bossAudio.loop,
      volume: this.bossAudio.volume,
    };
  }

  // --- SOUND EFFECTS ---

  public playSwordSwing(type: 'light' | 'heavy' | 'counter' | 'air'): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';

    if (type === 'heavy') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.22);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'counter') {
      // High energy slash with harmonic sweep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Light swing
      osc.type = 'sine';
      const startFreq = type === 'air' ? 380 : 320;
      osc.frequency.setValueAtTime(startFreq + (Math.random() * 40 - 20), now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
  }

  public playHit(type: 'flesh' | 'block' | 'crit' | 'heavy'): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    if (type === 'block') {
      // Metallic clang
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.14);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1250, now);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.18);
      osc2.stop(now + 0.18);
    } else {
      // Flesh / Impact
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'crit' || type === 'heavy' ? 'bandpass' : 'lowpass';
      filter.frequency.value = type === 'crit' ? 900 : 450;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(type === 'crit' ? 0.6 : 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      // Add sub thud
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(type === 'crit' ? 90 : 70, now);
      sub.frequency.exponentialRampToValueAtTime(25, now + 0.15);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      sub.connect(subGain);
      subGain.connect(this.sfxGain);

      noise.start(now);
      sub.start(now);
      noise.stop(now + 0.15);
      sub.stop(now + 0.15);
    }
  }

  public playParry(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Crystal resonance bell (High harmonic shine)
    const bell1 = this.ctx.createOscillator();
    const bell2 = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();

    bell1.type = 'sine';
    bell1.frequency.setValueAtTime(1760, now); // A6
    bell1.frequency.exponentialRampToValueAtTime(1600, now + 0.4);

    bell2.type = 'sine';
    bell2.frequency.setValueAtTime(2640, now); // E7 harmonic
    bell2.frequency.exponentialRampToValueAtTime(2400, now + 0.35);

    bellGain.gain.setValueAtTime(0.65, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    bell1.connect(bellGain);
    bell2.connect(bellGain);
    bellGain.connect(this.sfxGain);

    bell1.start(now);
    bell2.start(now);
    bell1.stop(now + 0.5);
    bell2.stop(now + 0.5);

    // 2. Heavy steel deflect shock
    const steel = this.ctx.createOscillator();
    const steelGain = this.ctx.createGain();
    steel.type = 'triangle';
    steel.frequency.setValueAtTime(420, now);
    steel.frequency.exponentialRampToValueAtTime(80, now + 0.25);
    steelGain.gain.setValueAtTime(0.45, now);
    steelGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    steel.connect(steelGain);
    steelGain.connect(this.sfxGain);

    steel.start(now);
    steel.stop(now + 0.25);
  }

  public playDash(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playJump(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playLand(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playBossRoar(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub-harmonic roar
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.linearRampToValueAtTime(120, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    osc2.frequency.setValueAtTime(65, now);
    osc2.frequency.linearRampToValueAtTime(105, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(35, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(950, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);
  }

  public playShockwave(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playMeteor(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playBeam(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.6);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playCheckpoint(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [293.66, 369.99, 440.0, 587.33]; // D F# A D
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  public playDialogueOpen(): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playDialogueBlip(speaker: 'yosuke' | 'malakor' | 'narrator' = 'yosuke'): void {
    if (!this.initCtx() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = speaker === 'malakor' ? 'sawtooth' : 'triangle';
    const baseFreq = speaker === 'malakor' ? 85 : 280;
    const pitchJitter = (Math.random() - 0.5) * 20;
    osc.frequency.setValueAtTime(baseFreq + pitchJitter, now);
    gain.gain.setValueAtTime(speaker === 'malakor' ? 0.08 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // --- DYNAMIC MUSIC LOOP ---

  public setMusicMode(mode: 'ambient' | 'combat' | 'boss' | 'ending' | 'none'): void {
    const prevMode = this.currentMusicMode;
    this.currentMusicMode = mode;

    // Handle Stage 3 Final Boss custom MP3 track
    if (mode === 'boss') {
      const bossTrack = this.ensureBossAudio();
      if (bossTrack) {
        if (prevMode !== 'boss') {
          bossTrack.currentTime = 0;
        }
        bossTrack.muted = this.isMuted;
        bossTrack.volume = this.isMuted ? 0 : 0.65;
        bossTrack.play().then(() => {
          this.isBossAudioPlaying = true;
        }).catch(() => {
          this.isBossAudioPlaying = false;
        });
      }
    } else if (this.bossAudio) {
      this.bossAudio.pause();
      this.bossAudio.currentTime = 0;
      this.isBossAudioPlaying = false;
    }

    if (mode === 'none') {
      this.stopMusic();
      return;
    }

    if (!this.isMusicRunning) {
      this.startMusic();
    }
  }

  public setPausedState(paused: boolean): void {
    if (this.currentMusicMode === 'boss' && this.bossAudio && !this.isMuted) {
      this.bossAudio.volume = paused ? 0.2 : 0.65;
    }
  }

  public startMusic(): void {
    if (!this.initCtx()) return;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }
    this.isMusicRunning = true;

    // Ticks every 250ms (sixteenth note at 120 bpm)
    this.musicInterval = window.setInterval(() => {
      this.tickMusic();
    }, 240);
  }

  public stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.bossAudio) {
      this.bossAudio.pause();
      this.bossAudio.currentTime = 0;
      this.isBossAudioPlaying = false;
    }
    this.isMusicRunning = false;
  }

  private tickMusic(): void {
    if (!this.ctx || this.isMuted || !this.musicGain || this.currentMusicMode === 'none') return;
    this.musicStep = (this.musicStep + 1) % 16;

    if (this.currentMusicMode === 'ambient') {
      // Atmospheric harp & drone
      if (this.musicStep % 4 === 0) {
        const noteIdx = [0, 2, 4, 3, 5, 1][Math.floor(this.musicStep / 4) % 6];
        this.playMusicNote(this.hirajoshiScale[noteIdx % this.hirajoshiScale.length], 0.6, 'sine', 0.12);
      }
      if (this.musicStep === 0) {
        // Deep drone
        this.playMusicNote(73.42, 1.8, 'triangle', 0.18); // D2
      }
    } else if (this.currentMusicMode === 'combat') {
      // Faster, rhythmic combat drive
      if (this.musicStep % 2 === 0) {
        const noteIdx = [0, 3, 4, 2, 5, 2, 1, 4][(this.musicStep / 2) % 8];
        this.playMusicNote(this.hirajoshiScale[noteIdx], 0.35, 'triangle', 0.15);
      }
      if (this.musicStep % 4 === 0) {
        // Driving sub bass
        this.playMusicNote(this.musicStep === 8 ? 82.41 : 73.42, 0.45, 'sawtooth', 0.22);
      }
    } else if (this.currentMusicMode === 'boss') {
      // If custom MP3 boss track is loaded, let the MP3 soundtrack drive the final battle without synth clash
      if (this.bossAudio) {
        if (this.bossAudio.paused && !this.isMuted) {
          this.bossAudio.play().then(() => {
            this.isBossAudioPlaying = true;
          }).catch(() => {});
        }
        return;
      }
      // Fallback synth if running in an environment without HTMLAudioElement
      if (this.musicStep % 2 === 0) {
        const brassFreq = [110, 116.54, 146.83, 110, 130.81, 116.54][(this.musicStep / 2) % 6];
        this.playMusicNote(brassFreq, 0.45, 'sawtooth', 0.25);
      }
      if (this.musicStep % 4 === 0) {
        this.playMusicNote(55, 0.5, 'square', 0.3);
      }
      if (this.musicStep === 0 || this.musicStep === 8) {
        this.playMusicNote(440, 1.2, 'sine', 0.15);
        this.playMusicNote(554.37, 1.2, 'sine', 0.12);
      }
    } else if (this.currentMusicMode === 'ending') {
      // Solemn, mournful resolution
      if (this.musicStep === 0) {
        this.playMusicNote(146.83, 3.5, 'triangle', 0.2); // D3
        this.playMusicNote(220.0, 3.5, 'sine', 0.18); // A3
      } else if (this.musicStep === 8) {
        this.playMusicNote(130.81, 3.5, 'triangle', 0.18); // C3
        this.playMusicNote(196.0, 3.5, 'sine', 0.15); // G3
      }
    }
  }

  private playMusicNote(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'sawtooth' ? 1100 : 2200, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}

export const audio = new SoundEngine();
