/**
 * Web Audio API Procedural Sound Synthesizer
 * ระบบเสียงสังเคราะห์ด้วย Web Audio API โดยไม่ต้องพึ่งพาไฟล์เสียงภายนอก
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmTimeoutId: number | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.15; // gentle BGM
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.3; // clear SFX
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = muted ? 0 : 0.15;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = muted ? 0 : 0.3;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // เสียงคลิกปุ่มสไตล์ไม้/เกมกดน่ารัก
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // เสียงกระโดด ดึ๋งๆ
  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // เสียงเก็บเหรียญหัวใจ กิ๊งๆ
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.5, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // เสียงฟันดาบ / เวทมนตร์ทำลายสิ่งกีดขวาง
  public playSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }


  // เสียงตอบถูก: เมโลดี้กระดิ่งใส C5 - E5 - G5 - C6
  public playCorrect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const noteStart = startTime + index * 0.08;
      const noteEnd = noteStart + 0.18;

      gain.gain.setValueAtTime(0.01, noteStart);
      gain.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  }

  // เสียงตอบผิด: เสียงทุ้มสั่นเบาๆ ไม่กระโชกโฮกฮาก
  public playWrong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [220, 180]; // A3, F#3
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const noteStart = startTime + index * 0.12;
      const noteEnd = noteStart + 0.2;

      gain.gain.setValueAtTime(0.25, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.01, noteEnd);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  }

  // เสียงกระดิ่งใสปิ๊งๆ ก่อนเริ่มอ่านโจทย์เสียงน่ารัก
  public playCuteVoiceChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const noteStart = startTime + index * 0.05;
      const noteEnd = noteStart + 0.18;

      gain.gain.setValueAtTime(0.01, noteStart);
      gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  }

  // เสียงดาวปิ๊งๆ
  public playStar(starIndex: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const baseFreq = [880, 1046.5, 1318.5][starIndex % 3] || 880;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // เสียงใช้ตัวช่วย (Lifeline magic)
  public playLifeline() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // เสียงจบด่าน ชนะฉลอง
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.24 }, // C6
      { f: 880.0, d: 0.14 },  // A5
      { f: 1046.5, d: 0.4 },  // C6 hold
    ];

    let t = this.ctx.currentTime;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = n.f;

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d);

      t += n.d * 0.85;
    });
  }

  // เสียง Game Over ปลอบใจ
  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [
      { f: 440, d: 0.2 },
      { f: 415.3, d: 0.2 },
      { f: 392, d: 0.2 },
      { f: 349.23, d: 0.4 },
    ];

    let t = this.ctx.currentTime;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = n.f;

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d);

      t += n.d * 0.9;
    });
  }

  // เพลงพื้นหลัง (BGM): เมโลดี้มาริมบา 8-บิต ฟังสบาย
  public startBgm() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.initContext();
    this.loopBgm();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId !== null) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }

  private loopBgm() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    // Peaceful playful pentatonic melody (C major pentatonic / G major)
    const melody = [
      { f: 261.63, d: 0.25 }, // C4
      { f: 329.63, d: 0.25 }, // E4
      { f: 392.00, d: 0.25 }, // G4
      { f: 523.25, d: 0.35 }, // C5
      { f: 440.00, d: 0.25 }, // A4
      { f: 392.00, d: 0.35 }, // G4
      { f: 329.63, d: 0.25 }, // E4
      { f: 293.66, d: 0.35 }, // D4

      { f: 261.63, d: 0.25 }, // C4
      { f: 329.63, d: 0.25 }, // E4
      { f: 392.00, d: 0.25 }, // G4
      { f: 440.00, d: 0.35 }, // A4
      { f: 523.25, d: 0.30 }, // C5
      { f: 587.33, d: 0.30 }, // D5
      { f: 523.25, d: 0.50 }, // C5
      { f: 0, d: 0.3 },      // pause
    ];

    let t = this.ctx.currentTime + 0.05;
    let totalDuration = 0;

    melody.forEach((note) => {
      totalDuration += note.d;
      if (note.f > 0 && this.ctx && this.bgmGain) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // soft marimba / xylophone timbre
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        noteGain.gain.setValueAtTime(0.01, t);
        noteGain.gain.linearRampToValueAtTime(0.12, t + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + note.d);
      }
      t += note.d;
    });

    // Schedule next loop
    this.bgmTimeoutId = window.setTimeout(() => {
      if (this.isBgmPlaying) {
        this.loopBgm();
      }
    }, totalDuration * 1000);
  }
}

export const sound = new SoundEngine();
