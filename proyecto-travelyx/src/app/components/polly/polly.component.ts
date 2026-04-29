import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollyService, PollyMessage } from '../../services/polly.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotes, volumeMute, qrCodeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-polly',
  templateUrl: './polly.component.html',
  styleUrls: ['./polly.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class PollyComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('muteBtn', { static: false }) muteBtnRef!: ElementRef;

  public pollyText = '';
  public showBubble = false;
  public showCursor = false;
  public showQrOptions = false;
  public mascotStateClass = 'idle-anim';
  public mascotImage = 'assets/polly/PULPITO 2.png';

  private POLLY_STATES: Record<string, string> = {
    'IDLE': 'assets/polly/PULPITO 2.png',
    'TALK': 'assets/polly/PULPITO 3.png',
    'HAPPY': 'assets/polly/PULPITO 4.png',
    'EXCITED': 'assets/polly/PULPITO 7.png'
  };

  private sub!: Subscription;
  private subEnd!: Subscription;
  private typingTimeout: any;
  private resetTimeout: any;
  private closeBubbleTimeout: any;
  private currentMsg: PollyMessage | null = null;

  // Indica si el speech ya terminó pero el texto aún se está escribiendo
  private speechFinished = false;

  constructor(
    public pollyService: PollyService,
    public langService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ musicalNotes, volumeMute, qrCodeOutline });
  }

  ngOnInit() {
    this.sub = this.pollyService.speak$.subscribe(msg => {
      this.handleSpeak(msg);
    });
    this.subEnd = this.pollyService.speechEnd$.subscribe(() => {
      this.handleSpeechEnd();
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.subEnd) this.subEnd.unsubscribe();
    this.clearTimers();
  }

  poke() {
    this.pollyService.speak(this.langService.translate('poke'), 'EXCITED');
  }

  toggleMute(event?: Event) {
    this.pollyService.toggleMute();
  }

  private handleSpeak(msg: PollyMessage) {
    // Si el mensaje está vacío, es una señal de stop()
    if (!msg.text) {
      this.currentMsg = null;
      this.closeBubble();
      return;
    }

    this.currentMsg = msg;
    this.speechFinished = false;
    this.clearTimers();
    this.showBubble = true;
    this.pollyText = '';
    this.showCursor = true;
    this.showQrOptions = false;

    this.mascotImage = this.POLLY_STATES[msg.state] || this.POLLY_STATES['TALK'];

    // Forzar reset de animación
    this.mascotStateClass = '';
    this.cdr.detectChanges();

    if (msg.state === 'HAPPY' || msg.state === 'EXCITED') {
      this.mascotStateClass = 'success-anim';
    } else {
      this.mascotStateClass = 'talk-anim';
    }

    // El typewriter muestra el texto en pantalla.
    // Velocidad calibrada: ~50ms/char para que vaya ligeramente por detrás de la voz.
    this.typeWriter(msg.text, 0, () => {
      this.showCursor = false;
      // Si la voz ya terminó antes que el typewriter, cerrar la burbuja ahora.
      if (this.speechFinished) {
        this.afterBothFinished();
      }
    });
  }

  private handleSpeechEnd() {
    this.speechFinished = true;

    // Actualizar la animación a idle
    this.mascotImage = this.POLLY_STATES['IDLE'];
    this.mascotStateClass = 'idle-anim';

    // Si el typewriter aún escribe cuando la voz termina, forzar que termine al instante
    if (this.showCursor) {
      if (this.typingTimeout) clearTimeout(this.typingTimeout);
      this.pollyText = this.currentMsg?.text || '';
      this.showCursor = false;
    }
    
    this.afterBothFinished();
  }

  /**
   * Se llama cuando TANTO la voz COMO el typewriter han terminado.
   * Aquí decidimos si mostrar opciones QR o cerrar la burbuja.
   */
  private afterBothFinished() {
    if (this.currentMsg?.requireQrResponse) {
      this.showQrOptions = true;
      // Cerrar automáticamente si el usuario no responde en 30s
      this.resetTimeout = setTimeout(() => {
        this.closeBubble();
      }, 30000);
    } else {
      // Mantener la burbuja visible 2 segundos para que el usuario pueda leerla
      this.closeBubbleTimeout = setTimeout(() => {
        this.closeBubble();
      }, 2000);
    }
  }

  private closeBubble() {
    this.showBubble = false;
    this.showQrOptions = false;
    this.speechFinished = false;
    this.mascotImage = this.POLLY_STATES['IDLE'];
    this.mascotStateClass = 'idle-anim';
  }

  public answerQr(wantsQr: boolean) {
    this.showQrOptions = false;
    this.closeBubble();
    this.pollyService.sendQrResponse(wantsQr);
  }

  private typeWriter(text: string, i: number, cb: () => void) {
    if (i < text.length) {
      this.pollyText = text.substring(0, i + 1);
      this.typingTimeout = setTimeout(() => this.typeWriter(text, i + 1, cb), 50);
    } else {
      this.pollyText = text;
      cb();
    }
  }

  private clearTimers() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    if (this.closeBubbleTimeout) clearTimeout(this.closeBubbleTimeout);
  }
}
