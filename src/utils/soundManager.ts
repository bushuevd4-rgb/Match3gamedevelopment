// Sound Manager for Match3 Game
// Uses Web Audio API to generate and play sounds

class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Silently fail if audio context is not ready
    }
  }

  playMatch() {
    // Match/clear sound - ascending notes
    this.playTone(523.25, 0.1, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.2), 50); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.2), 100); // G5
  }

  playCombo() {
    // Combo sound - ding!
    this.playTone(800, 0.08, 'sine', 0.3);
    setTimeout(() => this.playTone(1000, 0.12, 'sine', 0.3), 60);
  }

  playSwap() {
    // Tile swap sound - quick beep
    this.playTone(400, 0.05, 'sine', 0.15);
  }

  playInvalid() {
    // Invalid move - buzzer
    this.playTone(200, 0.08, 'square', 0.25);
    setTimeout(() => this.playTone(150, 0.08, 'square', 0.25), 60);
  }

  playWin() {
    // Victory fanfare
    this.playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.25), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.25), 200); // G5
    setTimeout(() => this.playTone(1046.50, 0.3, 'sine', 0.3), 300); // C6
  }

  playLose() {
    // Game over sad sound
    this.playTone(400, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(300, 0.2, 'sine', 0.25), 100);
  }

  playDialogue() {
    // Character dialogue sound - soft bell
    this.playTone(880, 0.05, 'sine', 0.15);
  }

  speakDialogue(text: string, character: 'kepa' | 'yablo' = 'yablo') {
    // Text-to-speech for character dialogue
    if (!this.soundEnabled) return;
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis?.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      utterance.pitch = character === 'kepa' ? 0.8 : 1.2;
      utterance.volume = 0.7;
      
      window.speechSynthesis?.speak(utterance);
    } catch (e) {
      console.warn('Speech Synthesis not supported:', e);
    }
  }
}

export const soundManager = new SoundManager();
