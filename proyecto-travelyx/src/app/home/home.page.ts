import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { PollyComponent } from '../components/polly/polly.component';
import { LanguageService } from '../services/language.service';
import { PollyService } from '../services/polly.service';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent, PollyComponent],
})
export class HomePage implements OnDestroy {
  private idleTimer: any;
  private langSub!: Subscription;

  constructor(
    public langService: LanguageService,
    private polly: PollyService,
    private navCtrl: NavController
  ) {}

  ionViewDidEnter() {
    this.startRandomGreeting();
    this.resetIdleTimer();

    // Al cambiar de idioma, reiniciar el timer para que el siguiente tip
    // sea evaluado con el idioma activo en ese momento.
    this.langSub = this.langService.currentLang$.subscribe(() => {
      this.resetIdleTimer();
    });
  }

  ionViewWillLeave() {
    this.clearTimers();
    if (this.langSub) this.langSub.unsubscribe();
  }

  ngOnDestroy() {
    this.clearTimers();
    if (this.langSub) this.langSub.unsubscribe();
  }

  private startRandomGreeting() {
    setTimeout(() => {
      this.polly.speak(this.langService.translate('welcome'), 'TALK');
    }, 1500);
  }

  private resetIdleTimer() {
    this.clearTimers();
    this.idleTimer = setTimeout(() => {
      // translate() se evalúa aquí: usa el idioma activo en este momento exacto
      this.polly.speak(this.langService.translate('tip'), 'HAPPY');
      this.resetIdleTimer();
    }, 25000);
  }

  private clearTimers() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  actionClick(id: string) {
    this.resetIdleTimer();
    this.polly.stop();
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
