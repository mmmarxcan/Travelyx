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
        // Solo saludar si seguimos en esta vista
        const variant = Math.floor(Math.random() * 4) + 1; // 1 a 4
        const key = `welcome_${variant}`;
        this.polly.speak(this.langService.translate(key), 'TALK', 5000);
    }, 1500);
  }

  private resetIdleTimer() {
    this.clearTimers();
    this.idleTimer = setTimeout(() => {
      const tipVariant = Math.floor(Math.random() * 2) + 1; // 1 a 2
      const key = `tip_${tipVariant}`;
      this.polly.speak(this.langService.translate(key), 'HAPPY', 6000);
      this.resetIdleTimer(); // Reiniciar para el siguiente tip
    }, 25000); // 25 segundos de inactividad
  }

  private clearTimers() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  actionClick(id: string) {
    this.resetIdleTimer(); // El usuario interactuó
    this.polly.speak(this.langService.translate(id), 'EXCITED', 4000);
    
    if (id === 'hotels') {
      setTimeout(() => this.navCtrl.navigateForward('/hotel-filters'), 800);
    } else if (id === 'restaurants') {
      setTimeout(() => this.navCtrl.navigateForward('/restaurant-filters'), 800);
    } else if (id === 'tourism') {
      setTimeout(() => this.navCtrl.navigateForward('/tourism-filters'), 800);
    } else if (id === 'map') {
      setTimeout(() => this.navCtrl.navigateForward('/map'), 1000);
    }
  }
}
