import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { PollyComponent } from '../../components/polly/polly.component';
import { LanguageService } from '../../services/language.service';
import { PollyService } from '../../services/polly.service';
import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-tourism-filters',
  templateUrl: './tourism-filters.page.html',
  styleUrls: ['./tourism-filters.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent]
})
export class TourismFiltersPage {

  selectedType: string | null = null;
  selectedPrice: string | null = null;
  selectedDuration: string | null = null;

  typeOptions = [
    { id: 'monument',  icon: '🗿', label: { es: 'Monumentos',    en: 'Monuments' } },
    { id: 'museum',    icon: '🏛️', label: { es: 'Museos',        en: 'Museums' } },
    { id: 'nature',    icon: '🌿', label: { es: 'Naturaleza',     en: 'Nature' } },
    { id: 'landmark',  icon: '📷', label: { es: 'Miradores',      en: 'Landmarks' } },
    { id: 'pier',      icon: '⚓', label: { es: 'Malecón',        en: 'Boardwalk' } },
    { id: 'any',       icon: '🔀', label: { es: 'Cualquiera',     en: 'Any' } },
  ];

  priceOptions = [
    { id: 'free',       icon: '🆓', label: { es: 'Gratuito',      en: 'Free' },         detail: { es: 'Sin costo de entrada', en: 'No entry fee' } },
    { id: 'low',        icon: '💲', label: { es: 'Económico',      en: 'Budget' },       detail: { es: 'Hasta $150 MXN',       en: 'Up to $150 MXN' } },
    { id: 'premium',    icon: '💲💲', label: { es: 'De paga',      en: 'Paid' },         detail: { es: 'Más de $150 MXN',      en: 'Over $150 MXN' } },
    { id: 'any',        icon: '🔀', label: { es: 'Cualquiera',     en: 'Any' },          detail: { es: 'Sin filtrar precio',   en: 'Any price' } },
  ];

  durationOptions = [
    { id: 'quick',      icon: '⚡',  label: { es: 'Rápida',        en: 'Quick' },     detail: { es: 'Menos de 30min', en: 'Under 30min' } },
    { id: 'medium',     icon: '⏱️',  label: { es: 'Media hora',     en: 'Half hour' }, detail: { es: '30min – 1h',     en: '30min – 1h' } },
    { id: 'half_day',   icon: '🕑',  label: { es: 'Medio día',      en: 'Half day' },  detail: { es: '1h – 3h',        en: '1h – 3h' } },
    { id: 'any',        icon: '🔀',  label: { es: 'Sin límite',     en: 'No limit' },  detail: { es: 'Cualquier duración', en: 'Any duration' } },
  ];

  constructor(
    public langService: LanguageService,
    private pollyService: PollyService,
    private prefService: PreferencesService,
    private navCtrl: NavController
  ) {
    setTimeout(() => {
      const lang = this.langService.currentLang;
      const msg = lang === 'es'
        ? '¡Progreso tiene historia y belleza! Cuéntame qué tipo de experiencia buscas.'
        : "Progreso has history and beauty! Tell me what kind of experience you're looking for.";
      this.pollyService.speak(msg, 'HAPPY');
    }, 600);
  }

  ionViewWillLeave() {
  }

  selectType(id: string) {
    this.selectedType = this.selectedType === id ? null : id;
  }

  selectPrice(id: string) {
    this.selectedPrice = this.selectedPrice === id ? null : id;
  }

  selectDuration(id: string) {
    this.selectedDuration = this.selectedDuration === id ? null : id;
  }

  get canContinue(): boolean {
    return this.selectedType !== null || this.selectedPrice !== null || this.selectedDuration !== null;
  }

  findAttractions() {
    this.prefService.setTourismPreferences({
      type: this.selectedType,
      price: this.selectedPrice
    });

    const lang = this.langService.currentLang;
    const msg = lang === 'es'
      ? '¡Vamos a explorar! Te muestro los lugares más interesantes cerca del malecón.'
      : "Let's explore! Here are the most interesting spots near the boardwalk.";
    this.pollyService.speak(msg, 'EXCITED');

    setTimeout(() => this.navCtrl.navigateForward('/results', {
      queryParams: { category: 'tourism' }
    }), 1200);
  }

  goBack() {
    this.pollyService.stop();
    this.navCtrl.navigateBack('/home');
  }
}
