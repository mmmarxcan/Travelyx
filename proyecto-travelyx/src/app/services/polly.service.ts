import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

  speak(text: string, state: 'IDLE' | 'TALK' | 'HAPPY' | 'EXCITED' = 'TALK', duration: number = 3000) {
    this.speakSubject.next({ text, state, duration });
  }
}
