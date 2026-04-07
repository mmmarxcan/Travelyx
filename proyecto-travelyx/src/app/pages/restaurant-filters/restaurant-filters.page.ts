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
  selector: 'app-restaurant-filters',
  templateUrl: './restaurant-filters.page.html',
  styleUrls: ['./restaurant-filters.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent]
})
export class RestaurantFiltersPage {

  selectedPrice: number | null = null;
  selectedCuisine: string | null = null;
  selectedFeatures: string[] = [];

  priceOptions = [
    { id: 1, icon: '💲',    label: { es: 'Económico',  en: 'Budget' },    detail: { es: 'Menos de $150 MXN', en: 'Under $150 MXN' } },
    { id: 2, icon: '💲💲',  label: { es: 'Moderado',   en: 'Moderate' },   detail: { es: '$150 – $400 MXN',  en: '$150 – $400 MXN' } },
    { id: 3, icon: '💲💲💲', label: { es: 'Gourmet',   en: 'Gourmet' },    detail: { es: 'Más de $400 MXN',  en: 'Over $400 MXN' } },
  ];

  cuisineOptions = [
    { id: 'seafood',    icon: '🦐', label: { es: 'Mariscos',    en: 'Seafood' } },
    { id: 'yucatecan',  icon: '🌽', label: { es: 'Yucateca',    en: 'Yucatecan' } },
    { id: 'mexican',    icon: '🌮', label: { es: 'Mexicana',    en: 'Mexican' } },
    { id: 'italian',    icon: '🍕', label: { es: 'Italiana',    en: 'Italian' } },
    { id: 'breakfast',  icon: '🥞', label: { es: 'Desayunos',   en: 'Breakfast' } },
    { id: 'bar',        icon: '🍺', label: { es: 'Bar / Cantina', en: 'Bar / Cantina' } },
    { id: 'any',        icon: '🔀', label: { es: 'Cualquiera',  en: 'Any' } },
  ];

  featureOptions = [
    { id: 'beach_view',    icon: '🌊', label: { es: 'Vista al mar',       en: 'Sea view' } },
    { id: 'delivery',      icon: '🛵', label: { es: 'Domicilio',           en: 'Delivery' } },
    { id: 'reservation',   icon: '📅', label: { es: 'Reservación',         en: 'Reservation' } },
    { id: 'open_late',     icon: '🌙', label: { es: 'Abierto tarde',       en: 'Open late' } },
    { id: 'family',        icon: '👨‍👩‍👧', label: { es: 'Familiar',           en: 'Family-friendly' } },
    { id: 'romantic',      icon: '💕', label: { es: 'Romántico',           en: 'Romantic' } },
  ];

  constructor(
    public langService: LanguageService,
    private pollyService: PollyService,
    private prefService: PreferencesService,
    private navCtrl: NavController
  ) {
    const lang = this.langService.currentLang;
    const msg = lang === 'es'
      ? '¡Tenemos los mejores sabores del malecón! Dime qué te apetece hoy.'
      : "We have the best flavors on the boardwalk! Tell me what you feel like today.";
    setTimeout(() => this.pollyService.speak(msg, 'HAPPY', 5000), 600);
  }

  selectPrice(id: number) {
    this.selectedPrice = this.selectedPrice === id ? null : id;
  }

  selectCuisine(id: string) {
    this.selectedCuisine = this.selectedCuisine === id ? null : id;
  }

  toggleFeature(id: string) {
    const idx = this.selectedFeatures.indexOf(id);
    if (idx >= 0) {
      this.selectedFeatures = this.selectedFeatures.filter(f => f !== id);
    } else {
      this.selectedFeatures = [...this.selectedFeatures, id];
    }
  }

  isFeatureSelected(id: string): boolean {
    return this.selectedFeatures.includes(id);
  }

  get canContinue(): boolean {
    return this.selectedPrice !== null || this.selectedCuisine !== null || this.selectedFeatures.length > 0;
  }

  findRestaurants() {
    this.prefService.setRestaurantPreferences({
      priceRange: this.selectedPrice,
      cuisine: this.selectedCuisine,
      features: this.selectedFeatures
    });

    const lang = this.langService.currentLang;
    const msg = lang === 'es'
      ? '¡Provecho! Aquí encontrarás los mejores restaurantes según tus gustos.'
      : "Enjoy your meal! Here are the best restaurants matching your taste.";
    this.pollyService.speak(msg, 'EXCITED', 5000);

    setTimeout(() => this.navCtrl.navigateForward('/results', {
      queryParams: { category: 'restaurant' }
    }), 1200);
  }

  goBack() {
    this.navCtrl.navigateBack('/home');
  }
}
