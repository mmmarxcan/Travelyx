import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { IonContent, IonModal, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import * as QRCode from 'qrcode';
import { addIcons } from 'ionicons';
import { closeOutline, qrCodeOutline } from 'ionicons/icons';
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
  imports: [IonContent, IonModal, IonIcon, CommonModule, PollyComponent]
})
export class MapPage implements OnInit, OnDestroy {
  private map!: L.Map;
  private currentRoute: L.Polyline | null = null;
  private markers: L.Marker[] = [];
  private kioskMarker!: L.Marker;
  private offlineRoutes: { [key: string]: number[][] } = {};
  
  // Estado del QR
  showQrModal = false;
  qrDataUrl: string | null = null;
  qrTimeout = 30;
  private timerInterval: any;
  public selectedPlaceForQr: Place | null = null;
  private activePlaceId: string | null = null;

  // Centro del Malecón (Kiosko)
  private readonly center: L.LatLngExpression = [21.288182, -89.662911];

  constructor(
    public langService: LanguageService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private pollyService: PollyService,
    private prefService: PreferencesService
  ) { 
    addIcons({ closeOutline, qrCodeOutline });
  }

  ngOnInit() {
    this.pollyService.qrResponse$.subscribe(wantsQr => {
      if (wantsQr) {
        this.requestQrCode();
      }
    });

    this.loadOfflineRoutes();
    setTimeout(() => {
      this.initMap();
      this.listenToLanguage();
    }, 100);

    // Polly explica brevemente qué puede hacer el usuario en el mapa
    setTimeout(() => {
      const msg = this.langService.translate('mapWelcome');
      this.pollyService.speak(msg, 'HAPPY');
    }, 1200);
  }

  private loadOfflineRoutes() {
    fetch('/assets/routes.json')
      .then(res => res.json())
      .then(data => {
        this.offlineRoutes = data;
        console.log('Rutas offline cargadas correctamente');
      })
      .catch(err => console.error('Error cargando rutas offline:', err));
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

  ionViewWillLeave() {
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

  private async onPlaceClick(place: Place) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.showQrModal = false;
    this.selectedPlaceForQr = null;

    this.drawRoute(place);
    this.activePlaceId = place.id;

    // Leer el idioma en el momento exacto de hablar, no antes
    const lang = this.langService.currentLang;
    const description = place.description[lang];
    let text = `${place.name}. ${description}`;

    await this.pollyService.speak(text, 'HAPPY');

    // Verificar que el lugar sigue activo Y que el idioma no cambió durante el await
    if (this.activePlaceId === place.id) {
      this.selectedPlaceForQr = place;
      // translate() lee el idioma actual en este momento (puede haber cambiado)
      const promptText = this.langService.translate('qrPromptDesc');
      this.pollyService.speak(promptText, 'EXCITED', true);
    }
  }

  private drawRoute(place: Place) {
    if (this.currentRoute) {
      this.map.removeLayer(this.currentRoute);
    }

    const routeData = this.offlineRoutes[place.id];

    if (routeData && routeData.length > 0) {
      // OSRM devuelve [lng, lat], Leaflet usa [lat, lng]
      const latLngs: L.LatLngTuple[] = routeData.map(coord => [coord[1], coord[0]]);
      
      this.currentRoute = L.polyline(latLngs, {
        color: '#0077B6',
        weight: 6,
        opacity: 0.8,
        dashArray: '10, 15',
        className: 'animated-route'
      }).addTo(this.map);
    } else {
      // Fallback a línea recta si no existe la ruta en el archivo json
      const kioskCoords: L.LatLngTuple = [21.288182, -89.662911];
      const finalCoords: L.LatLngTuple = [place.lat, place.lng];
      
      this.currentRoute = L.polyline([kioskCoords, finalCoords], {
        color: '#0077B6',
        weight: 6,
        opacity: 0.8,
        dashArray: '10, 15',
        className: 'animated-route'
      }).addTo(this.map);
    }

    this.map.fitBounds(this.currentRoute.getBounds().pad(0.5));
  }

  goBack() {
    this.pollyService.stop();
    this.navCtrl.navigateBack('/home');
  }

  // --- LÓGICA DEL QR ---
  requestQrCode() {
    this.generateQrCode();
    this.showQrModal = true;
  }

  closeQrModal() {
    this.showQrModal = false;
    this.qrDataUrl = null;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  async generateQrCode() {
    if (!this.selectedPlaceForQr) return;
    
    // Generar URL de Google Maps
    const origin = '21.288182,-89.662911';
    const dest = `${this.selectedPlaceForQr.lat},${this.selectedPlaceForQr.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    
    try {
      this.qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 1,
        color: { dark: '#03045E', light: '#FFFFFF' }
      });
      this.startQrTimer();
      
      const lang = this.langService.currentLang;
      const scanText = lang === 'es' ? '¡Escanea el código con tu cámara!' : 'Scan the code with your camera!';
      this.pollyService.speak(scanText, 'EXCITED');
    } catch (err) {
      console.error('Error generando QR offline', err);
    }
  }

  private startQrTimer() {
    this.qrTimeout = 30;
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.qrTimeout--;
      if (this.qrTimeout <= 0) {
        this.closeQrModal();
      }
    }, 1000);
  }
}
