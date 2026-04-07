import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { LanguageService } from '../../services/language.service';
import { PollyService } from '../../services/polly.service';
import { PlacesService, Place } from '../../services/places';
import { PreferencesService } from '../../services/preferences.service';
import { PollyComponent } from '../../components/polly/polly.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, PollyComponent, HeaderComponent]
})
export class MapPage implements OnInit, OnDestroy {
  private map!: L.Map;
  private currentRoute: L.Polyline | null = null;
  private markers: L.Marker[] = [];
  private kioskMarker!: L.Marker;

  // Centro del Malecón (Kiosko)
  private readonly center: L.LatLngExpression = [21.2882, -89.6580];

  constructor(
    public langService: LanguageService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private pollyService: PollyService,
    private prefService: PreferencesService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.initMap();
      this.listenToLanguage();
    }, 100);
  }

  private listenToLanguage() {
    this.langService.currentLang$.subscribe(() => {
        if (this.kioskMarker) {
            this.kioskMarker.setTooltipContent(this.langService.translate('kioskTooltip'));
        }
        this.renderPlaces();
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    this.map = L.map('map', {
      center: this.center,
      zoom: 16,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false, 
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // Marcador del Kiosko Estilizado
    const kioskIcon = L.divIcon({
        className: 'custom-marker marker-kiosk',
        html: '<div class="kiosk-pin"><span>🏠</span></div>',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    });
    this.kioskMarker = L.marker(this.center, { icon: kioskIcon }).addTo(this.map);
    this.kioskMarker.bindTooltip(this.langService.translate('kioskTooltip'), { permanent: true, direction: 'top', className: 'kiosk-tooltip' });

    this.renderPlaces();
  }

  private allPlaces: Place[] = [];

  private renderPlaces() {
    const categoryFilter = this.route.snapshot.queryParams['category'];

    this.placesService.getPlaces().subscribe(places => {
      this.allPlaces = places;
      this.clearMarkers();

      const placeId = this.route.snapshot.queryParams['placeId'];
      let finalCategory = categoryFilter;

      // Si no hay categoría pero hay placeId, inferir categoría para limpiar el mapa
      if (!finalCategory && placeId) {
        const p = places.find(x => x.id === placeId);
        if (p) finalCategory = p.type;
      }

      let filtered = places;
      if (placeId) {
        // 🎯 SI HAY SELECCIÓN: Mostrar SOLO el lugar elegido (limpieza total)
        filtered = places.filter(p => p.id === placeId);
      } else if (finalCategory) {
        // SI NO HAY SELECCIÓN: Mostrar la categoría con filtros
        filtered = this.applyPreferences(places, finalCategory);
      }
      filtered.forEach(place => {
        const isSelected = place.id === placeId;
        const icon = L.divIcon({
          className: `custom-marker marker-${place.type} ${isSelected ? 'marker-destination' : ''}`,
          html: `
            <div class="marker-container">
              <div class="marker-shadow"></div>
              <div class="marker-pin"><span>${place.icon}</span></div>
            </div>
          `,
          iconSize: [60, 60],
          iconAnchor: [30, 30]
        });

        const marker = L.marker([place.lat, place.lng], { icon }).addTo(this.map);
        this.markers.push(marker);
        
        // Tooltip Premium Automático para el destino
        if (isSelected) {
            marker.bindTooltip(place.name, { 
                permanent: true, 
                direction: 'top', 
                className: `premium-tooltip tooltip-${place.type}` 
            }).openTooltip();
        } else {
            marker.bindTooltip(place.name, { 
                direction: 'top', 
                className: 'premium-tooltip' 
            });
        }

        marker.on('click', () => {
          const latest = this.allPlaces.find(p => p.id === place.id) || place;
          this.onPlaceClick(latest);
        });
      });

      // Si hay filtros, hacer zoom para que quepan todos los resultados
      if (filtered.length > 0 && categoryFilter) {
        const group = L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.3));
      }

      // 🎯 NUEVO: Auto-seleccionar si viene placeId desde la pantalla de resultados
      if (placeId) {
        const selected = this.allPlaces.find(p => p.id === placeId);
        if (selected) {
          setTimeout(() => {
            this.onPlaceClick(selected);
          }, 800);
        }
      }
    });

    // 🔄 Segunda carga silenciosa para capturar traducciones nuevas
    setTimeout(() => {
      this.placesService.getPlaces().subscribe(updated => {
        this.allPlaces = updated;
      });
    }, 5000);
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

  private clearMarkers() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
  }

  private onPlaceClick(place: Place) {
    const lang = this.langService.currentLang;
    const description = place.description[lang];
    const text = `${place.name}. ${description}`;
    
    this.pollyService.speak(text, 'HAPPY', 7000);
    this.drawRoute(place);
  }

  private drawRoute(place: Place) {
    if (this.currentRoute) {
      this.map.removeLayer(this.currentRoute);
    }

    // Lógica de "Calle Principal": 
    // 1. Sale del Kiosko (21.2882, -89.6580)
    // 2. Se mueve por la latitud del Malecón (21.2882) hasta la longitud del destino
    // 3. Entra al establecimiento (latitud real del destino)
    
    const kioskCoords: L.LatLngTuple = [21.2882, -89.6580];
    const maleconPivot: L.LatLngTuple = [21.2882, place.lng];
    const finalCoords: L.LatLngTuple = [place.lat, place.lng];

    this.currentRoute = L.polyline([kioskCoords, maleconPivot, finalCoords], {
      color: '#0077B6',
      weight: 6,
      opacity: 0.8,
      dashArray: '10, 15',
      className: 'animated-route'
    }).addTo(this.map);

    this.map.fitBounds(this.currentRoute.getBounds().pad(0.5));
  }

  goBack() {
    this.navCtrl.navigateBack('/home');
  }
}
