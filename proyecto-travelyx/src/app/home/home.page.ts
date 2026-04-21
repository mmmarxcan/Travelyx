import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { PollyComponent } from '../components/polly/polly.component';
import { LanguageService } from '../services/language.service';
import { PollyService } from '../services/polly.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent, PollyComponent],
})
export class HomePage {
  private idleTimer: any;

  constructor(
    public langService: LanguageService,
    private polly: PollyService,
    private navCtrl: NavController
  ) {}

  ionViewDidEnter() {
    this.startRandomGreeting();
    this.resetIdleTimer();
  }

  ionViewWillLeave() {
    this.clearTimers();
  }

  private startRandomGreeting() {
    // Saludo inicial aleatorio tras un pequeño delay
    setTimeout(() => {
        this.polly.speak(this.langService.translate('welcome'), 'TALK');
    }, 1500);
  }

  private resetIdleTimer() {
    this.clearTimers();
    this.idleTimer = setTimeout(() => {
      this.polly.speak(this.langService.translate('tip'), 'HAPPY');
      this.resetIdleTimer(); // Reiniciar para el siguiente tip
    }, 25000); // 25 segundos de inactividad
  }

  private clearTimers() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  actionClick(id: string) {
    this.resetIdleTimer(); // El usuario interactuó
    this.polly.stop(); // Detener cualquier diálogo previo
    this.polly.speak(this.langService.translate(id), 'EXCITED');
    
    if (id === 'hotels') {
      setTimeout(() => this.navCtrl.navigateForward('/hotel-filters'), 1500);
    } else if (id === 'restaurants') {
      setTimeout(() => this.navCtrl.navigateForward('/restaurant-filters'), 1500);
    } else if (id === 'tourism') {
      setTimeout(() => this.navCtrl.navigateForward('/tourism-filters'), 1500);
    } else if (id === 'map') {
      setTimeout(() => this.navCtrl.navigateForward('/map'), 1500);
    }
  }
}
