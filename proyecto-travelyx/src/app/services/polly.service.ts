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

  constructor(private langService: LanguageService) {
    this.langService.currentLang$.subscribe(() => {
      this.stop();
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

  // Permite a PollyComponent emitir la respuesta del usuario
  sendQrResponse(wantsQr: boolean) {
    this.qrResponseSubject.next(wantsQr);
  }

  stop() {
    this.synth.cancel();
    this.speakSubject.next({ text: '', state: 'IDLE' } as any);
    this.speechEndSubject.next();
  }

  private speakSpeech(text: string, resolveCb: () => void) {
    // Cancelar cualquier mensaje previo
    this.synth.cancel();

    const lang = this.langService.currentLang;
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => {
        this.speechEndSubject.next();
        resolveCb();
    };

    utterance.onerror = () => {
        this.speechEndSubject.next();
        resolveCb();
    };
    
    // Configurar idioma y voz
    utterance.lang = lang === 'es' ? 'es-MX' : 'en-US';
    
    // Intentar buscar una voz masculina premium según el idioma
    const voices = this.synth.getVoices();
    
    const isEnglish = lang === 'en';
    // Nombres de voces masculinas comunes para cada idioma (Edge, Windows, Google)
    const maleNames = isEnglish 
      ? ['guy', 'ryan', 'david', 'mark', 'andrew', 'male', 'natural', 'online', 'google']
      : ['alvaro', 'jorge', 'pablo', 'male', 'natural', 'online', 'google'];
    
    // Filtro para encontrar voces masculinas de alta calidad estrictamente del idioma actual
    let preferredVoice = voices.find(v => 
      (v.lang.includes(utterance.lang)) && 
      maleNames.some(name => v.name.toLowerCase().includes(name))
    );

    // FALLBACK CRÍTICO: Si no encuentra una voz masculina premium en ese idioma, 
    // debe seleccionar CUALQUIER voz en ese idioma para evitar que lea números en español.
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.includes(utterance.lang));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 1.0; // Tono neutro para voz masculina
    utterance.rate = 1;
    
    this.synth.speak(utterance);
  }
}
