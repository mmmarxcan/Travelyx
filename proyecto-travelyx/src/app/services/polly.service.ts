import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LanguageService } from './language.service';

export interface PollyMessage {
  text: string;
  state: 'IDLE' | 'TALK' | 'HAPPY' | 'EXCITED';
  requireQrResponse?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PollyService {
  private speakSubject = new Subject<PollyMessage>();
  public speak$ = this.speakSubject.asObservable();
  
  private qrResponseSubject = new Subject<boolean>();
  public qrResponse$ = this.qrResponseSubject.asObservable();

  private speechEndSubject = new Subject<void>();
  public speechEnd$ = this.speechEndSubject.asObservable();
  
  private synth = window.speechSynthesis;
  public isMuted: boolean = false;

  // Guardamos el resolve pendiente para no dejar promesas colgadas
  private pendingResolve: (() => void) | null = null;
  // Watcher para el bug de Chrome que pausa indefinidamente en textos largos
  private keepAliveInterval: any = null;

  constructor(private langService: LanguageService) {
    this.langService.currentLang$.subscribe(() => {
      // Al cambiar idioma: cancelar síntesis y descartar promesas pendientes
      // sin resolverlas, para cortar flujos async que tengan texto del idioma anterior.
      this.stopKeepAlive();
      this.synth.cancel();
      this.pendingResolve = null; // Descartar sin resolver (corta el await)
      this.speakSubject.next({ text: '', state: 'IDLE' } as any);
      this.speechEndSubject.next();
    });
  }

  private numberToEnglishWords(n: number): string {
    const a = ['','one ','two ','three ','four ','five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    const b = ['','','twenty ','thirty ','forty ','fifty ','sixty ','seventy ','eighty ','ninety '];
    if (n === 0) return 'zero';
    if (n < 20) return a[n].trim();
    if (n < 100) return (b[Math.floor(n/10)] + a[n%10]).trim();
    if (n < 1000) return (a[Math.floor(n/100)] + 'hundred ' + this.numberToEnglishWords(n%100)).trim();
    return n.toString();
  }

  speak(text: string, state: 'IDLE' | 'TALK' | 'HAPPY' | 'EXCITED' = 'TALK', requireQrResponse: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      // Resolver la promesa anterior antes de comenzar una nueva
      this.resolvePending();

      let finalText = text;
      if (this.langService.currentLang === 'en') {
        finalText = text.replace(/\d+/g, (match) => {
          const num = parseInt(match, 10);
          return this.numberToEnglishWords(num);
        });
      }

      this.speakSubject.next({ text: finalText, state, requireQrResponse });
      this.speakSpeech(finalText, resolve);
    });
  }

  sendQrResponse(wantsQr: boolean) {
    this.qrResponseSubject.next(wantsQr);
  }

  stop() {
    this.stopKeepAlive();
    this.synth.cancel();
    this.resolvePending();
    this.speakSubject.next({ text: '', state: 'IDLE' } as any);
    this.speechEndSubject.next();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopKeepAlive();
      this.synth.cancel();
      this.resolvePending();
    }
  }

  /** Resuelve y limpia la promesa pendiente si existe */
  private resolvePending() {
    if (this.pendingResolve) {
      const cb = this.pendingResolve;
      this.pendingResolve = null;
      cb();
    }
  }

  /** Keep-alive para el bug de Chrome que pausa frases largas */
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.synth.paused) {
        this.synth.resume();
      }
    }, 5000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private speakSpeech(text: string, resolveCb: () => void) {
    this.stopKeepAlive();
    this.synth.cancel();

    if (this.isMuted) {
      // En modo mudo: simular tiempo proporcional al texto para mantener el flujo
      const delayMs = Math.max(1500, (text.length / 15) * 1000);
      let cancelled = false;
      const t = setTimeout(() => {
        if (!cancelled) {
          this.speechEndSubject.next();
          resolveCb();
          this.pendingResolve = null;
        }
      }, delayMs);
      this.pendingResolve = () => {
        cancelled = true;
        clearTimeout(t);
        resolveCb();
      };
      return;
    }

    this.pendingResolve = resolveCb;

    const lang = this.langService.currentLang;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      this.startKeepAlive();
    };

    utterance.onend = () => {
      this.stopKeepAlive();
      this.speechEndSubject.next();
      this.resolvePending();
    };

    utterance.onerror = (event) => {
      // 'interrupted' y 'canceled' son errores normales causados por cancel(),
      // no son fallas reales — los ignoramos para no disparar speechEnd$ de más.
      if ((event as any).error === 'interrupted' || (event as any).error === 'canceled') {
        return;
      }
      this.stopKeepAlive();
      this.speechEndSubject.next();
      this.resolvePending();
    };

    utterance.lang = lang === 'es' ? 'es-MX' : 'en-US';

    const voices = this.synth.getVoices();
    const isEnglish = lang === 'en';
    const maleNames = isEnglish
      ? ['guy', 'ryan', 'david', 'mark', 'andrew', 'male', 'natural', 'online', 'google']
      : ['alvaro', 'jorge', 'pablo', 'male', 'natural', 'online', 'google'];

    let preferredVoice = voices.find(v =>
      v.lang.includes(utterance.lang) &&
      maleNames.some(name => v.name.toLowerCase().includes(name))
    );

    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.includes(utterance.lang));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 1.0;
    utterance.rate = 1;

    this.synth.speak(utterance);
  }
}
