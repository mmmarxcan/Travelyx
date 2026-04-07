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
  constructor(
    public langService: LanguageService,
    private polly: PollyService,
    private navCtrl: NavController
  ) {}

  actionClick(id: string) {
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
