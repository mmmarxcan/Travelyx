import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LanguageService } from './language.service';

export interface PollyMessage {
  text: string;
  state: 'IDLE' | 'TALK' | 'HAPPY' | 'EXCITED';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class PollyService {
  private speakSubject = new Subject<PollyMessage>();
  public speak$ = this.speakSubject.asObservable();
  private synth = window.speechSynthesis;

  constructor(private langService: LanguageService) {}

  speak(text: string, state: 'IDLE' | 'TALK' | 'HAPPY' | 'EXCITED' = 'TALK', duration: number = 3000) {
    this.speakSubject.next({ text, state, duration });
    this.speakSpeech(text);
  }

  private speakSpeech(text: string) {
    // Cancelar cualquier mensaje previo
    this.synth.cancel();

    const lang = this.langService.currentLang;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar idioma y voz
    utterance.lang = lang === 'es' ? 'es-MX' : 'en-US';
    
    // Intentar buscar una voz femenina premium
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => 
      (v.lang.includes(utterance.lang)) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('sabina') || v.name.toLowerCase().includes('zira'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 1.2; // Un poco más aguda para que suene como mascota
    utterance.rate = 1;
    
    this.synth.speak(utterance);
  }
}
