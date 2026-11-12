/**
 * บริการอ่านออกเสียงภาษาไทย (Thai Text-To-Speech) คุณภาพสูง
 * ออกแบบพิเศษสำหรับเด็กประถม: เสียงสำเนียงไทยแท้ ชัดเจน ถูกต้องทุกพยัญชนะ สระ และวรรณยุกต์
 * 
 * ใช้ระบบ Hybrid Engine:
 * 1. Cloud Native Thai TTS Engine (Google Cloud Thai Audio Stream ผ่าน Proxy /api/tts)
 *    - แก้ปัญหาอุปกรณ์ของผู้ใช้ที่ไม่มีเสียงภาษาไทยติดตั้งในระบบปฏิบัติการ (Windows/Mac/Linux ทั่วไป)
 *    - ออกเสียงภาษาไทยได้ถูกต้อง 100% สำเนียงเป็นธรรมชาติ นุ่มนวล ชัดถ้อยชัดคำ
 * 2. Web Speech API Fallback (window.speechSynthesis)
 *    - รองรับการทำงานแบบออฟไลน์ หรือหากไม่สามารถเชื่อมต่อเน็ตเวิร์กได้
 */

import { sound } from './audio';

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  playChime?: boolean;
}

export interface SpeakCuteQuestionParams {
  title?: string;
  question: string;
  choices?: string[];
  withChoices?: boolean;
  questionNumber?: number;
  prefix?: string;
}

class SpeechService {
  private isAvailable: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;
  private currentQueue: string[] = [];
  private isCurrentlySpeaking: boolean = false;
  private playToken: number = 0;

  // Web Speech API fallback variables
  private synth: SpeechSynthesis | null = null;
  private thaiVoice: SpeechSynthesisVoice | null = null;
  private cutePitch: number = 1.25;
  private cuteRate: number = 1.05;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initLocalVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initLocalVoices();
        }
      }
    }
  }

  private initLocalVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const thaiVoices = voices.filter(
        (v) => v.lang === 'th-TH' || v.lang.startsWith('th') || v.name.toLowerCase().includes('thai')
      );

      if (thaiVoices.length > 0) {
        const scored = thaiVoices.map((v) => {
          let score = 0;
          const lower = v.name.toLowerCase();
          if (lower.includes('google')) score += 12;
          if (lower.includes('natural') || lower.includes('online')) score += 10;
          if (
            lower.includes('premwadee') ||
            lower.includes('kanya') ||
            lower.includes('narisa') ||
            lower.includes('siri') ||
            lower.includes('wanwisa')
          ) {
            score += 8;
          }
          if (lower.includes('female')) score += 4;
          if (v.lang === 'th-TH') score += 2;
          return { voice: v, score };
        });
        scored.sort((a, b) => b.score - a.score);
        this.thaiVoice = scored[0]?.voice || thaiVoices[0];
      }
    } catch {
      // Ignored
    }
  }

  public get available(): boolean {
    return this.isAvailable;
  }

  /**
   * ล้างและจัดข้อความภาษาไทยให้ออกเสียงได้อย่างถูกต้อง เป็นธรรมชาติ น่าฟัง
   */
  public sanitizeThaiText(text: string): string {
    return text
      .replace(/➔/g, 'แล้วไปที่')
      .replace(/\+/g, ' บวก ')
      .replace(/ - /g, ' ลบ ')
      .replace(/ = /g, ' เท่ากับ ')
      .replace(/ x /g, ' คูณ ')
      .replace(/ × /g, ' คูณ ')
      .replace(/ ÷ /g, ' หาร ')
      .replace(/\.IMG/gi, 'ดอทไอเอ็มจี')
      .replace(/JPG/gi, 'เจเป็ก')
      .replace(/PNG/gi, 'พีเอ็นจี')
      .replace(/GIF/gi, 'กิ๊ฟ')
      .replace(/MP3/gi, 'เอ็มพีสาม')
      .replace(/CPU/gi, 'ซีพียู')
      .replace(/STEM/gi, 'สะเต็ม')
      .replace(/S-T-E-M/gi, 'เอส ที อี เอ็ม')
      .replace(/Loop/gi, 'ลูปการวนซ้ำ')
      .replace(/Algorithm/gi, 'อัลกอริทึม')
      .replace(/Debugging/gi, 'การดีบักแก้ไขข้อผิดพลาด')
      .replace(/Sequencing/gi, 'การจัดลำดับขั้นตอน')
      .replace(/08:00 น\./g, 'แปดนาฬิกาตรง')
      .replace(/12:00 น\./g, 'สิบสองนาฬิกาตรง')
      .replace(/06:00 น\./g, 'หกนาฬิกาตรง')
      .replace(/35฿/g, 'สามสิบห้าบาท')
      .replace(/50 บาท/g, 'ห้าสิบบาท')
      .replace(/15 บาท/g, 'สิบห้าบาท')
      .replace(/100%/g, 'หนึ่งร้อยเปอร์เซ็นต์')
      .replace(/60%/g, 'หกสิบเปอร์เซ็นต์')
      .replace(/40%/g, 'สี่สิบเปอร์เซ็นต์')
      .replace(/20%/g, 'ยี่สิบเปอร์เซ็นต์')
      .replace(/6\/8/g, 'หกในแปด')
      .replace(/°C/g, 'องศาเซลเซียส')
      .replace(/ก\.ม\./g, 'กิโลเมตร')
      .replace(/ซ\.ม\./g, 'เซนติเมตร')
      .replace(/ก\.ก\./g, 'กิโลกรัม')
      .replace(/\(Narrator\)/gi, '')
      .replace(/\(Mia\)/gi, '')
      .replace(/\(Leaf\)/gi, '')
      .replace(/\(Noa\)/gi, '')
      .replace(/\(Bloopie\)/gi, '')
      .replace(/\(Robi\)/gi, '')
      // ลบคำลงท้ายที่ไม่เป็นทางการ เช่น จ้า, จ๊ะ
      .replace(/นะจ๊ะ/g, 'นะ')
      .replace(/จ๊ะ/g, '')
      .replace(/นะจ้า/g, 'นะ')
      .replace(/จ้า/g, '')
      // ลบสัญลักษณ์พิเศษและอีโมจิ
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}❖⚔️🚀💕⭐🌱🌧️🧲🧠🤖🔒🎵📐⚙️🪢⚖️✈️🍕🪙🔺⏰🦋💎🛸💨🔋🌟📖📜💖🎀📢✨🏆🎒🪄🔍]/gu, ' ')
      .replace(/\.{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * แบ่งข้อความเป็นท่อนสั้นๆ ไม่เกิน 85 ตัวอักษร เพื่อให้เสียงอ่านไม่สะดุดและไม่มีการตัดทอน
   */
  private splitIntoChunks(text: string, maxLen: number = 85): string[] {
    const rawSentences = text.split(/([.!?\n]+|\.{2,})/g).filter(Boolean);
    const chunks: string[] = [];
    let current = '';

    for (const part of rawSentences) {
      if ((current + part).length <= maxLen) {
        current += part;
      } else {
        if (current.trim()) chunks.push(current.trim());
        if (part.length > maxLen) {
          const words = part.split(/\s+/);
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).length <= maxLen) {
              sub = sub ? sub + ' ' + w : w;
            } else {
              if (sub.trim()) chunks.push(sub.trim());
              // ข้อความไทยที่ไม่มีเว้นวรรคเลยและยาวเกินกำหนด ต้องตัดตามความยาว ไม่เช่นนั้น TTS จะปฏิเสธทั้งท่อน
              let rest = w;
              while (rest.length > maxLen) {
                chunks.push(rest.slice(0, maxLen));
                rest = rest.slice(maxLen);
              }
              sub = rest;
            }
          }
          current = sub;
        } else {
          current = part;
        }
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  /**
   * สร้าง Audio URL จากข้อความภาษาไทย (ลองผ่าน Proxy ก่อน หากล้มเหลวจะใช้ Direct Google URL)
   */
  private getAudioUrl(text: string, useProxy: boolean = true): string {
    const encoded = encodeURIComponent(text.trim());
    if (useProxy) {
      return `/api/tts?q=${encoded}`;
    }
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
  }

  /**
   * อ่านข้อความภาษาไทยด้วย Cloud Audio Engine
   */
  public speak(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    },
    options?: SpeakOptions
  ) {
    // หยุดเสียงเดิมที่กำลังเล่นอยู่
    this.stop();

    const cleanText = this.sanitizeThaiText(text);
    if (!cleanText) {
      callbacks?.onEnd?.();
      return;
    }

    // เสียงกระดิ่งปิ๊งๆ ใสน่ารัก
    if (options?.playChime !== false) {
      sound.playCuteVoiceChime();
    }

    const currentToken = ++this.playToken;
    this.isCurrentlySpeaking = true;
    callbacks?.onStart?.();

    const chunks = this.splitIntoChunks(cleanText);
    this.currentQueue = [...chunks];

    // Proxy /api/tts มีเฉพาะใน Vite dev server เท่านั้น บนเว็บที่ deploy แล้วให้เรียก Google โดยตรง
    const proxyAvailable = Boolean((import.meta as any).env?.DEV);

    // เมื่อ Cloud Audio ใช้ไม่ได้ ให้ Web Speech อ่านต่อเฉพาะส่วนที่ยังไม่ได้อ่าน (ไม่เริ่มใหม่ตั้งแต่ต้น)
    const fallbackFrom = (failedText: string) => {
      const remaining = [failedText, ...this.currentQueue];
      this.currentQueue = [];
      this.fallbackSpeakChunks(remaining, currentToken, callbacks, options);
    };

    const playNextChunk = (useProxy: boolean = proxyAvailable) => {
      // ตรวจสอบว่าถูกสั่งหยุดหรือเริ่มเล่นเสียงอื่นไปแล้วหรือไม่
      if (currentToken !== this.playToken || this.currentQueue.length === 0) {
        this.isCurrentlySpeaking = false;
        callbacks?.onEnd?.();
        return;
      }

      const nextText = this.currentQueue.shift()!;
      const audioUrl = this.getAudioUrl(nextText, useProxy);

      try {
        const audio = new Audio();
        this.currentAudio = audio;

        // ปรับความเร็วเสียงให้ออกมาสดใสและน่ารัก
        audio.playbackRate = options?.rate ?? 1.06;
        audio.src = audioUrl;

        audio.onended = () => {
          if (currentToken === this.playToken) {
            playNextChunk(useProxy);
          }
        };

        audio.onerror = () => {
          if (currentToken !== this.playToken) return;

          // หาก Proxy ล้มเหลว ให้ลองเล่นผ่าน Direct Google URL
          if (useProxy) {
            this.currentQueue.unshift(nextText);
            playNextChunk(false);
          } else {
            // หากระบบ Audio ทั้งสองทางใช้ไม่ได้ ให้สลับไปใช้ Web Speech API Fallback
            fallbackFrom(nextText);
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (currentToken !== this.playToken) return;
            console.warn('[Speech] Audio play error, falling back:', err);
            if (useProxy) {
              this.currentQueue.unshift(nextText);
              playNextChunk(false);
            } else {
              fallbackFrom(nextText);
            }
          });
        }
      } catch (e) {
        console.warn('[Speech] Exception in playNextChunk:', e);
        fallbackFrom(nextText);
      }
    };

    // เริ่มเล่นท่อนแรก
    playNextChunk();
  }

  /**
   * ตัวเลือกสำรอง: ใช้ Web Speech API ในกรณีที่ไม่มีการเชื่อมต่อเครือข่าย
   */
  private fallbackSpeakChunks(
    chunks: string[],
    token: number,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    },
    options?: SpeakOptions
  ) {
    const finish = (failed: boolean) => {
      if (token !== this.playToken) return;
      this.isCurrentlySpeaking = false;
      if (failed) callbacks?.onError?.();
      callbacks?.onEnd?.();
    };

    if (!this.synth) {
      finish(true);
      return;
    }

    this.stopLocalSynth();
    if (!this.thaiVoice) {
      this.initLocalVoices();
    }

    // หากเครื่องไม่มีเสียงภาษาไทย เบราว์เซอร์จะใช้เสียงภาษาอังกฤษแทน ซึ่งจะข้ามตัวอักษรไทยทั้งหมด
    // และอ่านเฉพาะตัวเลข/คำอังกฤษ จึงเลือกไม่อ่านเลยดีกว่าอ่านผิดภาษา
    if (!this.thaiVoice) {
      console.warn('[Speech] No Thai voice installed and cloud TTS unavailable; skipping speech.');
      finish(true);
      return;
    }

    // อ่านทีละท่อนสั้นๆ เพราะ Chrome มักตัดเสียงกลางคันเมื่อ utterance ยาวเกินไป
    const queue = [...chunks];
    const speakNext = () => {
      if (token !== this.playToken) return;
      const next = queue.shift();
      if (!next) {
        finish(false);
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(next);
        utterance.lang = 'th-TH';
        utterance.voice = this.thaiVoice;
        utterance.rate = options?.rate ?? this.cuteRate;
        utterance.pitch = options?.pitch ?? this.cutePitch;
        utterance.onend = speakNext;
        utterance.onerror = () => finish(true);
        this.synth!.speak(utterance);
      } catch {
        finish(true);
      }
    };
    speakNext();
  }

  /**
   * อ่านโจทย์คำถามพร้อมตัวเลือกด้วยเสียงน่ารักสไตล์น้องชิบิ (Cute Chibi Companion Voice)
   */
  public speakCuteQuestion(
    params: SpeakCuteQuestionParams,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    const { title, question, choices, withChoices, questionNumber, prefix } = params;

    let speechText = '';

    // คำเกริ่นนำ
    if (prefix) {
      speechText += `${prefix}. `;
    } else if (questionNumber) {
      speechText += `คำถามข้อที่ ${questionNumber}. `;
    } else {
      speechText += `คำถามข้อนี้. `;
    }

    if (title) {
      speechText += `หัวข้อ ${title}. `;
    }

    speechText += `${question}. `;

    // ถ้ากดให้อ่านพร้อมตัวเลือก (สำหรับคนพิการหรือผู้เรียนที่ต้องการฟังช้อยส์)
    if (withChoices && choices && choices.length > 0) {
      const choiceLabels = ['ข้อ ก', 'ข้อ ข', 'ข้อ ค', 'ข้อ ง', 'ข้อ จ'];
      const choicesFormatted = choices
        .map((c, i) => `${choiceLabels[i] || `ข้อที่ ${i + 1}`}. ${c}.`)
        .join(' ');
      speechText += `ตัวเลือกมีดังนี้. ${choicesFormatted}`;
    }

    this.speak(
      speechText,
      callbacks,
      {
        rate: 1.05,
        playChime: true,
      }
    );
  }

  /**
   * หยุดการอ่านเสียงทันที
   */
  public stop() {
    this.playToken++;
    this.isCurrentlySpeaking = false;
    this.currentQueue = [];

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {
        // Ignored
      }
      this.currentAudio = null;
    }

    this.stopLocalSynth();
  }

  private stopLocalSynth() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignored
      }
    }
  }

  /**
   * ตรวจสอบว่ากำลังอ่านอยู่หรือไม่
   */
  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }
}

export const speech = new SpeechService();
