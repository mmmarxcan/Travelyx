import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollyService, PollyMessage } from '../../services/polly.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-polly',
  templateUrl: './polly.component.html',
  styleUrls: ['./polly.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PollyComponent implements OnInit, OnDestroy {
  public pollyText = '';
  public showBubble = false;
  public showCursor = false;
  public mascotStateClass = 'idle-anim';
  public mascotImage = 'assets/polly/PULPITO 2.png';

  private POLLY_STATES: Record<string, string> = {
    'IDLE': 'assets/polly/PULPITO 2.png',
    'TALK': 'assets/polly/PULPITO 3.png',
    'HAPPY': 'assets/polly/PULPITO 4.png',
    'EXCITED': 'assets/polly/PULPITO 7.png'
  };

  private sub!: Subscription;
  private typingTimeout: any;
  private resetTimeout: any;
  private greetingDone = false;

  constructor(
    private pollyService: PollyService,
    private langService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = this.pollyService.speak$.subscribe(msg => {
      this.handleSpeak(msg);
    });

    setTimeout(() => {
      if (!this.greetingDone) {
        this.pollyService.speak(this.langService.translate('welcome'), 'TALK', 4000);
        this.greetingDone = true;
      }
    }, 1500);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.clearTimers();
  }

  poke() {
    this.pollyService.speak(this.langService.translate('poke'), 'EXCITED', 2000);
  }

  private handleSpeak(msg: PollyMessage) {
    this.clearTimers();
    this.showBubble = true;
    this.pollyText = '';
    this.showCursor = true;

    this.mascotImage = this.POLLY_STATES[msg.state] || this.POLLY_STATES['TALK'];
    
    this.mascotStateClass = '';
    this.cdr.detectChanges(); 

    if (msg.state === 'HAPPY' || msg.state === 'EXCITED') {
      this.mascotStateClass = 'success-anim';
    } else {
      this.mascotStateClass = 'talk-anim';
    }

    this.typeWriter(msg.text, 0, () => {
      this.showCursor = false;
      this.resetTimeout = setTimeout(() => {
        this.showBubble = false;
        this.mascotImage = this.POLLY_STATES['IDLE'];
        this.mascotStateClass = 'idle-anim';
      }, msg.duration);
    });
  }

  private typeWriter(text: string, i: number, cb: () => void) {
    if (i < text.length) {
      this.pollyText = text.substring(0, i + 1);
      this.typingTimeout = setTimeout(() => this.typeWriter(text, i + 1, cb), 40);
    } else {
      this.pollyText = text;
      cb();
    }
  }

  private clearTimers() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
  }
}
