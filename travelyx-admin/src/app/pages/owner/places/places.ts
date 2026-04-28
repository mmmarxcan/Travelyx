import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { PlacesOwnerService } from '../../../services/places-owner';

declare var L: any;

const CATEGORIES = [
  { id: 1, label: 'Hotel',                slug: 'hotel',        icon: '🏨', desc: 'Hostales, Villas, Resorts y Hoteles Boutique.' },
  { id: 3, label: 'Zona Turística',       slug: 'tourist_spot', icon: '🌋', desc: 'Playas, Manglares, Museos y Sitios Arqueológicos.' },
  { id: 2, label: 'Restaurante',          slug: 'restaurant',   icon: '🍴', desc: 'Comida local, Mariscos y Gastronomía de Progreso.' },
];

const ACC_TYPES = ['Hotel Boutique', 'Hostal', 'Resort', 'Villa', 'Glamping', 'Hotel Estándar'];
const ATTRACTION_TYPES = ['Naturaleza', 'Arqueológico', 'Gastronómico', 'Cultural', 'Aventura', 'Religioso'];
const CUISINE_TYPES = ['Italiana', 'Mexicana', 'Vegana', 'Parrilla', 'Mariscos', 'Fusión', 'Yucateca', 'Internacional'];

@Component({
  selector: 'app-owner-places',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './places.html',
  styleUrl: './places.css'
})
export class OwnerPlaces implements OnInit {
  places: any[] = [];
  categories = CATEGORIES;
  accTypes = ACC_TYPES;
  attractionTypes = ATTRACTION_TYPES;
  cuisineTypes = CUISINE_TYPES;
  
  amenities: any[] = [];
  groupedAmenities: { group: string, items: any[] }[] = [];
  
  isModalOpen = false;
  showSelectionStep = true;
  isSaving = false;
  successMessage = '';
  
  filterCategoryId: number | null = null;
  editingPlaceId: number | null = null;
  activeTab: string = 'identificacion';

  daysOfWeek = [
    { name: 'Lunes',     slug: 'lun', open: '08:00', close: '20:00', closed: false },
    { name: 'Martes',    slug: 'mar', open: '08:00', close: '20:00', closed: false },
    { name: 'Miércoles', slug: 'mie', open: '08:00', close: '20:00', closed: false },
    { name: 'Jueves',    slug: 'jue', open: '08:00', close: '20:00', closed: false },
    { name: 'Viernes',   slug: 'vie', open: '08:00', close: '20:00', closed: false },
    { name: 'Sábado',    slug: 'sab', open: '09:00', close: '18:00', closed: false },
    { name: 'Domingo',   slug: 'dom', open: '09:00', close: '18:00', closed: false },
  ];

  form: any = {
    name:                '',
    category_id:         null,
    phone:               '',
    whatsapp:            '',
    website_url:         '',
    social_url:          '',
    address:             '',
    lat:                 21.2844,
    lng:                 -89.6603,
    description_es:      '',
    description_en:      '',
    amenity_ids:         [],
    stars:               0,
    accommodation_type:  '',
    house_rules:         '',
    cancellation_policy: '',
    slogan:              '',
    opening_hours:       '',
    best_time:           '',
    price_adult:         0,
    price_child:         0,
    price_local:         0,
    estimated_duration:  '',
    price_range:         1,
    featured_dish:       '',
    menu_url:            '',
    requires_reservation: false,
    capacity:            0,
    stay_time:           '',
    delivery:            false,
    pickup:              false,
    custom_prices:       []
  };

  galleryPreviews: string[] = [];
  private ownerId!: number;
  private map: any;
  private marker: any;

  constructor(
    private auth: AuthService,
    private placesService: PlacesOwnerService,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredPlaces() {
    if (!this.filterCategoryId) return this.places;
    return this.places.filter(p => Number(p.category_id) === Number(this.filterCategoryId));
  }

  ngOnInit(): void {
    const uid = this.auth.getUserId();
    if (uid) {
      this.ownerId = uid;
      this.loadPlaces();
      this.loadAmenities();
    }
  }

  loadPlaces(): void {
    this.placesService.getMyPlaces(this.ownerId).subscribe({
      next: (data) => {
        this.places = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando negocios:', err)
    });
  }

  loadAmenities(catId?: number): void {
    this.placesService.getAmenities(catId).subscribe({
      next: (data) => {
        this.amenities = data;
        this.groupAmenities();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando amenidades:', err)
    });
  }

  groupAmenities(): void {
    const groups: { [key: string]: any[] } = {};
    if (!this.amenities || this.amenities.length === 0) {
      this.groupedAmenities = [];
      return;
    }
    this.amenities.forEach(a => {
      const g = a.group || 'Otros';
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    });
    this.groupedAmenities = Object.keys(groups).map(key => ({
      group: key,
      items: groups[key]
    }));
    this.cdr.detectChanges();
  }

  openModal(): void {
    this.resetForm();
    this.editingPlaceId = null;
    this.isModalOpen = true;
    this.showSelectionStep = true;
    this.cdr.detectChanges();
  }

  addCustomPrice() {
    this.form.custom_prices.push({ label: '', price: 0, image_url: '' });
  }

  removeCustomPrice(index: number) {
    this.form.custom_prices.splice(index, 1);
  }

  onCustomPriceImageSelected(event: any, index: number): void {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (!this.form.custom_prices[index]) return;
        this.form.custom_prices[index].image_url = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(files[0]);
    }
  }

  removeCustomPriceImage(index: number): void {
    if (this.form.custom_prices[index]) {
      this.form.custom_prices[index].image_url = '';
      this.cdr.detectChanges();
    }
  }

  getCustomPricesTitle(): string {
    if (this.form.category_id === 1) return 'Tipos de Habitaciones';
    if (this.form.category_id === 2) return 'Menú / Platillos';
    if (this.form.category_id === 3) return 'Tours / Actividades Especiales';
    return 'Precios Personalizados';
  }

  getCustomPricesExample(): string {
    if (this.form.category_id === 1) return 'Ej: "Habitación Master: $1500"';
    if (this.form.category_id === 2) return 'Ej: "Tacos de Camarón: $120"';
    if (this.form.category_id === 3) return 'Ej: "Recorrido VIP: $500"';
    return 'Ej: "Servicio Premium: $500"';
  }

  getCustomPricesPlaceholder(): string {
    if (this.form.category_id === 1) return 'Nombre de la habitación';
    if (this.form.category_id === 2) return 'Nombre del platillo';
    if (this.form.category_id === 3) return 'Nombre de la actividad';
    return 'Descripción';
  }

  editPlace(p: any): void {
    this.resetForm();
    this.editingPlaceId = p.id;
    this.form = {
      ...this.form,
      owner_id: p.owner_id,
      category_id: p.category_id,
      name: p.name,
      phone: p.phone,
      whatsapp: p.whatsapp,
      website_url: p.website_url,
      social_url: p.social_url,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      stars: p.stars,
      accommodation_type: p.accommodation_type,
      house_rules: p.house_rules,
      cancellation_policy: p.cancellation_policy,
      slogan: p.slogan,
      opening_hours: p.opening_hours,
      best_time: p.best_time,
      price_adult: p.price_adult,
      price_child: p.price_child,
      price_local: p.price_local,
      estimated_duration: p.estimated_duration,
      price_range: p.price_range,
      featured_dish: p.featured_dish,
      menu_url: p.menu_url,
      capacity: p.capacity,
      stay_time: p.stay_time,
      delivery: p.delivery,
      pickup: p.pickup,
      requires_reservation: p.requires_reservation,
      cuisine: p.cuisine,
      custom_prices: p.custom_prices ? JSON.parse(p.custom_prices) : []
    };

    if (p.translations) {
      const es = p.translations.find((t: any) => t.language_code === 'es');
      const en = p.translations.find((t: any) => t.language_code === 'en');
      if (es) this.form.description_es = es.description;
      if (en) this.form.description_en = en.description;
    }

    if (p.amenities) {
      this.form.amenity_ids = p.amenities.map((a: any) => a.amenity_id);
    }

    // Poblar imágenes existentes
    if (p.images && Array.isArray(p.images)) {
      this.galleryPreviews = p.images.map((img: any) => img.image_url);
    }

    if (p.opening_hours) {
      try {
        const lines = p.opening_hours.split('\n');
        lines.forEach((line: string) => {
          const [dayName, hours] = line.split(': ');
          const day = this.daysOfWeek.find(d => d.name === dayName);
          if (day) {
            if (hours === 'Cerrado') {
              day.closed = true;
            } else {
              const [open, close] = hours.split(' - ');
              day.open = open;
              day.close = close;
              day.closed = false;
            }
          }
        });
      } catch (e) {}
    }

    this.showSelectionStep = false;
    this.isModalOpen = true;
    this.activeTab = 'identificacion';
    this.loadAmenities(p.category_id);
    this.cdr.detectChanges();
  }

  selectCategory(catId: number): void {
    this.form.category_id = catId;
    this.showSelectionStep = false;
    this.activeTab = 'identificacion';
    this.loadAmenities(catId);
    this.cdr.detectChanges();
  }

  setTab(tab: any): void {
    this.activeTab = tab;
    if (tab === 'ubicacion') {
      setTimeout(() => this.initMap(), 100);
    }
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.galleryPreviews.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.galleryPreviews.splice(index, 1);
  }

  toggleAmenity(id: number): void {
    const idx = this.form.amenity_ids.indexOf(id);
    if (idx > -1) this.form.amenity_ids.splice(idx, 1);
    else this.form.amenity_ids.push(id);
  }

  isAmenitySelected(id: number): boolean {
    return this.form.amenity_ids.includes(id);
  }

  resetForm(): void {
    this.form = {
      name: '', category_id: null, phone: '', whatsapp: '',
      website_url: '', social_url: '', address: '', lat: 21.2844, lng: -89.6603,
      description_es: '', description_en: '', amenity_ids: [],
      stars: 0, accommodation_type: '', house_rules: '', cancellation_policy: '',
      slogan: '', opening_hours: '', best_time: '',
      price_adult: 0, price_child: 0, price_local: 0, estimated_duration: '',
      price_range: 1, featured_dish: '', menu_url: '', requires_reservation: false,
      capacity: 0, stay_time: '', delivery: false, pickup: false,
      custom_prices: []
    };
    this.galleryPreviews = [];
    this.successMessage = '';
    this.daysOfWeek.forEach(d => {
      d.closed = false;
      d.open = '08:00';
      d.close = '20:00';
    });
  }

  initMap(): void {
    if (this.map) this.map.remove();
    this.map = L.map('owner-map').setView([this.form.lat, this.form.lng], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(this.map);
    this.marker = L.marker([this.form.lat, this.form.lng], { draggable: true }).addTo(this.map);
    this.map.on('click', (e: any) => this.updateMarker(e.latlng.lat, e.latlng.lng));
    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.updateMarker(pos.lat, pos.lng);
    });
  }

  updateMarker(lat: number, lng: number): void {
    this.form.lat = lat; this.form.lng = lng;
    this.marker.setLatLng([lat, lng]);
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.loadPlaces();
  }

  formatOpeningHours(): string {
    return this.daysOfWeek
      .map(d => `${d.name}: ${d.closed ? 'Cerrado' : d.open + ' - ' + d.close}`)
      .join('\n');
  }

  savePlace(): void {
    this.isSaving = true;
    this.form.opening_hours = this.formatOpeningHours();
    this.form.owner_id = this.ownerId;

    const observer = {
      next: () => {
        this.isSaving = false;
        this.successMessage = this.editingPlaceId 
          ? '¡Cambios guardados con éxito!' 
          : '¡Negocio registrado con éxito! Pendiente de aprobación.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSaving = false;
        alert('Error: ' + (err.error?.error || 'No se pudo guardar'));
      }
    };

    if (this.editingPlaceId) {
      this.placesService.updatePlace(this.editingPlaceId, { ...this.form, images: this.galleryPreviews }).subscribe(observer);
    } else {
      this.placesService.createPlace({ ...this.form, images: this.galleryPreviews }).subscribe(observer);
    }
  }

  getCategoryLabel(id: number): string {
    return this.categories.find(c => c.id === Number(id))?.label || '-';
  }
}
