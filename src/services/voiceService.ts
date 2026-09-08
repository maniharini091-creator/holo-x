import { ScreenId } from '../types';
import { soundFx } from './soundFx';

type SpeechRecognitionType = any;

interface VoiceMatch {
  commandLabel: string;
  actionLabel: string;
  screenTarget?: ScreenId;
  actionType: 'NAVIGATE' | 'BACK' | 'HOME' | 'UNKNOWN';
}

export class VoiceService {
  private recognition: SpeechRecognitionType = null;
  private isListening: boolean = false;
  private onCommandCallback: ((match: VoiceMatch, rawTranscript: string) => void) | null = null;
  private onStatusChangeCallback: ((status: 'READY' | 'LISTENING' | 'PROCESSING' | 'UNAVAILABLE' | 'ERROR', transcript?: string) => void) | null = null;
  private enabled: boolean = true;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[HoloX Voice] Web Speech API not supported in this browser environment.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChangeCallback?.('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        this.onStatusChangeCallback?.('PROCESSING', transcript);
        this.processPhrase(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[HoloX Voice] Error:', event.error);
        if (event.error === 'not-allowed') {
          this.onStatusChangeCallback?.('UNAVAILABLE');
          this.isListening = false;
        } else {
          this.onStatusChangeCallback?.('ERROR');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart if user still has voice listening enabled
        if (this.enabled) {
          setTimeout(() => {
            if (this.enabled && !this.isListening) {
              this.start();
            }
          }, 400);
        } else {
          this.onStatusChangeCallback?.('READY');
        }
      };
    } catch (err) {
      console.error('[HoloX Voice] Setup failed:', err);
    }
  }

  public setCallbacks(
    onCommand: (match: VoiceMatch, rawTranscript: string) => void,
    onStatusChange: (status: 'READY' | 'LISTENING' | 'PROCESSING' | 'UNAVAILABLE' | 'ERROR', transcript?: string) => void
  ) {
    this.onCommandCallback = onCommand;
    this.onStatusChangeCallback = onStatusChange;
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public start() {
    this.enabled = true;
    if (!this.recognition) {
      this.onStatusChangeCallback?.('UNAVAILABLE');
      return;
    }
    if (this.isListening) return;

    try {
      this.recognition.start();
    } catch {
      // recognition may already be starting
    }
  }

  public stop() {
    this.enabled = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.onStatusChangeCallback?.('READY');
  }

  public toggle(): boolean {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public processPhrase(phrase: string) {
    const p = phrase.toLowerCase();

    let match: VoiceMatch = {
      commandLabel: phrase,
      actionLabel: 'Command not recognized',
      actionType: 'UNKNOWN',
    };

    if (p.includes('open phone') || p.includes('call') || p.includes('dialer')) {
      match = { commandLabel: 'Open Phone', actionLabel: 'Opening Phone', screenTarget: 'phone', actionType: 'NAVIGATE' };
    } else if (p.includes('open messages') || p.includes('open message') || p.includes('messages') || p.includes('chat') || p.includes('text')) {
      match = { commandLabel: 'Open Messages', actionLabel: 'Opening Messages', screenTarget: 'messages', actionType: 'NAVIGATE' };
    } else if (p.includes('open calculator') || p.includes('calculator') || p.includes('calc')) {
      match = { commandLabel: 'Open Calculator', actionLabel: 'Opening Calculator', screenTarget: 'calculator', actionType: 'NAVIGATE' };
    } else if (p.includes('open camera') || p.includes('camera') || p.includes('take photo')) {
      match = { commandLabel: 'Open Camera', actionLabel: 'Opening Camera', screenTarget: 'camera', actionType: 'NAVIGATE' };
    } else if (p.includes('open gallery') || p.includes('gallery') || p.includes('photos') || p.includes('pictures')) {
      match = { commandLabel: 'Open Gallery', actionLabel: 'Opening Gallery', screenTarget: 'gallery', actionType: 'NAVIGATE' };
    } else if (p.includes('open music') || p.includes('play music') || p.includes('music')) {
      match = { commandLabel: 'Open Music', actionLabel: 'Opening Music', screenTarget: 'music', actionType: 'NAVIGATE' };
    } else if (p.includes('show contacts') || p.includes('open contacts') || p.includes('contacts')) {
      match = { commandLabel: 'Show Contacts', actionLabel: 'Showing Contacts', screenTarget: 'contacts', actionType: 'NAVIGATE' };
    } else if (p.includes('open settings') || p.includes('settings')) {
      match = { commandLabel: 'Open Settings', actionLabel: 'Opening Settings', screenTarget: 'settings', actionType: 'NAVIGATE' };
    } else if (p.includes('calendar') || p.includes('open calendar')) {
      match = { commandLabel: 'Open Calendar', actionLabel: 'Opening Calendar', screenTarget: 'calendar', actionType: 'NAVIGATE' };
    } else if (p.includes('go home') || p.includes('home') || p.includes('home screen')) {
      match = { commandLabel: 'Go Home', actionLabel: 'Returning Home', screenTarget: 'home', actionType: 'HOME' };
    } else if (p.includes('go back') || p.includes('back') || p.includes('previous')) {
      match = { commandLabel: 'Go Back', actionLabel: 'Navigating Back', actionType: 'BACK' };
    }

    if (match.actionType !== 'UNKNOWN') {
      soundFx.playVoiceCommandChime();
    }

    this.onCommandCallback?.(match, phrase);
  }
}

export const voiceService = new VoiceService();
