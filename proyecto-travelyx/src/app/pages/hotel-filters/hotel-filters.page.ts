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
  selector: 'app-hotel-filters',
  templateUrl: './hotel-filters.page.html',
  styleUrls: ['./hotel-filters.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent]
})
export class HotelFiltersPage {

  // ── Preferencias seleccionadas ─────────────────────────────────────────────
  selectedBudget: number | null = null;
  selectedStars: number | null = null;
  selectedType: string | null = null;

  // ── Opciones disponibles ───────────────────────────────────────────────────
  budgets = [
    { id: 1, icon: '💲',    label: { es: 'Económico', en: 'Budget' },         detail: { es: 'Menos de $500 MXN', en: 'Under $500 MXN' } },
    { id: 2, icon: '💲💲',  label: { es: 'Intermedio', en: 'Mid-range' },      detail: { es: '$500 – $1,500 MXN', en: '$500 – $1,500 MXN' } },
    { id: 3, icon: '💲💲💲', label: { es: 'Premium', en: 'Premium' },           detail: { es: 'Más de $1,500 MXN', en: 'Over $1,500 MXN' } },
  ];

  starOptions = [
    { stars: 1, label: '⭐',              sub: { es: 'Básico', en: 'Basic' } },
    { stars: 2, label: '⭐⭐',            sub: { es: 'Cómodo', en: 'Comfortable' } },
    { stars: 3, label: '⭐⭐⭐',          sub: { es: 'Estándar', en: 'Standard' } },
    { stars: 4, label: '⭐⭐⭐⭐',        sub: { es: 'Superior', en: 'Superior' } },
    { stars: 5, label: '⭐⭐⭐⭐⭐',      sub: { es: 'Lujo', en: 'Luxury' } },
    { stars: 0, label: '🔀',              sub: { es: 'Cualquiera', en: 'Any' } },
  ];

  hotelTypes = [
    { id: 'Hotel Familiar',    icon: '👨‍👩‍👧',  label: { es: 'Familiar',   en: 'Family' } },
    { id: 'Hotel de Playa',    icon: '🏖️',   label: { es: 'Playa',      en: 'Beach' } },
    { id: 'Hotel Boutique',    icon: '🏛️',   label: { es: 'Boutique',   en: 'Boutique' } },
    { id: 'Hotel Estándar',    icon: '🏨',   label: { es: 'Estándar',   en: 'Standard' } },
    { id: 'any',               icon: '🔀',   label: { es: 'Cualquiera', en: 'Any' } },
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
        ? '¡Ayúdame a encontrar el hotel perfecto para ti! Elige tus preferencias.'
        : "Let me find the perfect hotel for you! Choose your preferences.";
      this.pollyService.speak(msg, 'HAPPY');
    }, 600);
  }

  ionViewWillLeave() {
  }

  selectBudget(id: number) {
    this.selectedBudget = this.selectedBudget === id ? null : id;
  }

  selectStars(stars: number) {
    this.selectedStars = this.selectedStars === stars ? null : stars;
  }

  selectType(id: string) {
    this.selectedType = this.selectedType === id ? null : id;
  }

  get canContinue(): boolean {
    // At least one preference must be selected
    return this.selectedBudget !== null || this.selectedStars !== null || this.selectedType !== null;
  }

  findHotels() {
    this.prefService.setHotelPreferences({
      budget: this.selectedBudget,
      stars: this.selectedStars,
      type: this.selectedType
    });

    const lang = this.langService.currentLang;
    const msg = lang === 'es'
      ? '¡Perfecto! Aquí están los hoteles que más se acercan a lo que buscas.'
      : "Perfect! Here are the hotels that best match your preferences.";
    this.pollyService.speak(msg, 'EXCITED');

    setTimeout(() => this.navCtrl.navigateForward('/results', {
      queryParams: { category: 'hotel' }
    }), 1200);
  }

  goBack() {
    this.pollyService.stop();
    this.navCtrl.navigateBack('/home');
  }
}
