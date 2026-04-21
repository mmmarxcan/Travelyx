import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { PollyComponent } from '../../components/polly/polly.component';
import { LanguageService } from '../../services/language.service';
import { PollyService } from '../../services/polly.service';
import { PreferencesService } from '../../services/preferences.service';
import { PlacesService, Place } from '../../services/places';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, CommonModule, HeaderComponent, PollyComponent]
})
export class ResultsPage implements OnInit {

  filteredPlaces: Place[] = [];
  suggestedPlaces: Place[] = [];
  category: string = 'hotel';
  isShowingSuggestions: boolean = false;
  isMenuOpen: boolean = false;
  selectedPlace: Place | null = null;

  constructor(
    public langService: LanguageService,
    private pollyService: PollyService,
    private prefService: PreferencesService,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    this.category = this.route.snapshot.queryParams['category'] || 'hotel';
    this.loadResults();
    
    const lang = this.langService.currentLang;
    const msg = lang === 'es' 
      ? '¡He encontrado estas opciones increíbles para ti! ¿Cuál te gustaría visitar?' 
      : 'I found these amazing options for you! Which one would you like to visit?';
    
    setTimeout(() => this.pollyService.speak(msg, 'HAPPY'), 800);
  }

  loadResults() {
    this.placesService.getPlaces().subscribe(places => {
      this.filteredPlaces = this.applyPreferences(places, this.category);
      
      if (this.filteredPlaces.length === 0) {
        this.isShowingSuggestions = true;
        this.suggestedPlaces = places.filter(p => p.type === this.category);
        
        const lang = this.langService.currentLang;
        const msg = lang === 'es' 
          ? 'No encontré una coincidencia exacta, pero aquí tienes unas sugerencias geniales que te gustarán.' 
          : 'I couldn\'t find an exact match, but here are some great suggestions you might like.';
        
        setTimeout(() => this.pollyService.speak(msg, 'HAPPY'), 1000);
      }
    });
  }

  ionViewWillLeave() {
  }

  private applyPreferences(places: Place[], category: string): Place[] {
    const p = places.filter(pl => pl.type === category);
    
    if (category === 'hotel') {
      const prefs = this.prefService.getHotelPreferences();
      return p.filter(pl => {
        const matchesBudget = !prefs.budget || pl.price_range === prefs.budget;
        const matchesStars = !prefs.stars || (prefs.stars === 0 || pl.stars === prefs.stars);
        const matchesType = !prefs.type || (prefs.type === 'any' || pl.accommodation_type === prefs.type);
        return matchesBudget && matchesStars && matchesType;
      });
    }

    if (category === 'restaurant') {
      const prefs = this.prefService.getRestaurantPreferences();
      return p.filter(pl => {
        const matchesPrice = !prefs.priceRange || pl.price_range === prefs.priceRange;
        const matchesCuisine = !prefs.cuisine || (prefs.cuisine === 'any' || pl.cuisine === prefs.cuisine);
        const matchesDelivery = !prefs.features.includes('delivery') || pl.delivery;
        const matchesReserv = !prefs.features.includes('reservation') || pl.requires_reservation;
        return matchesPrice && matchesCuisine && matchesDelivery && matchesReserv;
      });
    }

    if (category === 'tourism') {
      const prefs = this.prefService.getTourismPreferences();
      return p.filter(pl => {
        const matchesPrice = !prefs.price || (prefs.price === 'any' || (prefs.price === 'free' ? (pl.price_adult ?? 0) === 0 : (pl.price_adult ?? 0) > 0));
        return matchesPrice;
      });
    }

    return p;
  }

  openMenu(event: Event, place: Place) {
    event.stopPropagation();
    this.selectedPlace = place;
    this.isMenuOpen = true;
  }

  selectPlace(place: Place) {
    this.selectedPlace = place;
    const lang = this.langService.currentLang;
    const msg = lang === 'es' 
      ? `¡Excelente elección! Te guiaré hacia ${place.name}.` 
      : `Excellent choice! I'll guide you to ${place.name}.`;
    
    this.pollyService.speak(msg, 'EXCITED');

    setTimeout(() => {
      this.navCtrl.navigateForward('/map', {
        queryParams: { placeId: place.id }
      });
    }, 1000);
  }

  goToPlaceFromModal() {
    if (this.selectedPlace) {
      this.isMenuOpen = false;
      this.selectPlace(this.selectedPlace);
    }
  }

  goBack() {
    this.pollyService.stop();
    this.navCtrl.navigateBack(`/${this.category}-filters`);
  }
}
