/**
 * Web Audio API Sound Synthesizer for Zen Tile Match 3D
 * Pure procedural synthesis with zero external audio assets.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.65;
  public ambientEnabled: boolean = true;
  public hapticsEnabled: boolean = true;
  private ambientInterval: number | null = null;

  constructor() {
    try {
      const savedMute = localStorage.getItem('tile_match_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';

      const savedVol = localStorage.getItem('tile_match_vol');
      if (savedVol !== null) this.volume = parseFloat(savedVol) || 0.65;

      const savedAmbient = localStorage.getItem('tile_match_ambient');
      if (savedAmbient !== null) this.ambientEnabled = savedAmbient !== 'false';

      const savedHaptics = localStorage.getItem('tile_match_haptics');
      if (savedHaptics !== null) this.hapticsEnabled = savedHaptics !== 'false';
    } catch {
      // LocalStorage error fallback
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('tile_match_muted', String(muted));
    } catch { /* ignore */ }
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('tile_match_vol', String(this.volume));
    } catch { /* ignore */ }
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  public setHaptics(enabled: boolean) {
    this.hapticsEnabled = enabled;
    try {
      localStorage.setItem('tile_match_haptics', String(enabled));
    } catch { /* ignore */ }
  }

  public triggerHaptic(pattern: number | number[] = 15) {
    if (this.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }

  /**
   * Tile Pick / Select: Crisp wooden marimba / kalimba click
   */
  public playTileSelect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(1240, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 0.11);
      oscHarmonic.stop(now + 0.11);

      this.triggerHaptic(12);
    } catch { /* ignore */ }
  }

  /**
   * Blocked / Covered Tile Tap: Dull wooden knock
   */
  public playTileBlocked() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);

      this.triggerHaptic([20, 20]);
    } catch { /* ignore */ }
  }

  /**
   * Triple Tile Match Sparkle: Harmonious major pentatonic arpeggio
   */
  public playMatch(combo: number = 0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const baseScales = [
        [523.25, 659.25, 783.99],       // C Major: C5, E5, G5
        [587.33, 739.99, 880.00],       // D Major
        [659.25, 830.61, 987.77],       // E Major
        [783.99, 987.77, 1174.66],      // G Major
        [880.00, 1108.73, 1318.51],     // A Major
        [1046.50, 1318.51, 1567.98]     // Super High C6
      ];
      const chords = baseScales[Math.min(combo, baseScales.length - 1)];

      const now = this.ctx.currentTime;
      chords.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.05);

        noteGain.gain.setValueAtTime(0.35, now + idx * 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.32);

        noteOsc.connect(noteGain);
        noteGain.connect(this.masterGain);

        noteOsc.start(now + idx * 0.05);
        noteOsc.stop(now + idx * 0.05 + 0.33);
      });

      this.triggerHaptic([25, 30, 45]);
    } catch { /* ignore */ }
  }

  /**
   * Power-up: Undo Tile whoosh
   */
  public playUndo() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.17);
      this.triggerHaptic(15);
    } catch { /* ignore */ }
  }

  /**
   * Power-up: Shuffle board swish
   */
  public playShuffle() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300 + i * 90, now + i * 0.04);
        gain.gain.setValueAtTime(0.2, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.11);
      }
      this.triggerHaptic([20, 20, 20]);
    } catch { /* ignore */ }
  }

  /**
   * Power-up: Magic Wand / Auto Match
   */
  public playMagicWand() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const freqs = [784, 988, 1175, 1568];
      freqs.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.3, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.29);
      });
      this.triggerHaptic([30, 40, 60]);
    } catch { /* ignore */ }
  }

  /**
   * Danger Warning: dock has 6/7 slots filled!
   */
  public playWarning() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.13);
      this.triggerHaptic([40, 20, 40]);
    } catch { /* ignore */ }
  }

  /**
   * Stage Victory Fanfare
   */
  public playVictory() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.32, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.51);
      });
      this.triggerHaptic([20, 40, 30, 50, 100]);
    } catch { /* ignore */ }
  }

  /**
   * Game Over Descending Melancholy Chime
   */
  public playGameOver() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const notes = [440, 392, 349.23, 293.66];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.14);
        gain.gain.setValueAtTime(0.28, now + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.41);
      });
      this.triggerHaptic([60, 40, 80]);
    } catch { /* ignore */ }
  }

  /**
   * Gentle Zen Ambient Chime loop (plays soft harmonic singing bowl tone periodically)
   */
  public toggleAmbientMusic(enabled?: boolean) {
    if (enabled !== undefined) {
      this.ambientEnabled = enabled;
    } else {
      this.ambientEnabled = !this.ambientEnabled;
    }
    try {
      localStorage.setItem('tile_match_ambient', String(this.ambientEnabled));
    } catch { /* ignore */ }

    if (this.ambientEnabled && !this.isMuted) {
      this.startAmbientLoop();
    } else {
      this.stopAmbientLoop();
    }
  }

  private startAmbientLoop() {
    if (this.ambientInterval) return;
    this.playAmbientSingingBowl();
    this.ambientInterval = window.setInterval(() => {
      if (this.ambientEnabled && !this.isMuted) {
        this.playAmbientSingingBowl();
      }
    }, 7000);
  }

  private stopAmbientLoop() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  private playAmbientSingingBowl() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const pentatonic = [392.00, 440.00, 523.25, 587.33, 659.25];
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.6);
    } catch { /* ignore */ }
  }
}

export const sound = new SoundController();
