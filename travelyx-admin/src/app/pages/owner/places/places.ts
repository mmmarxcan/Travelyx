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
  
  activeTab: string = 'identificacion';

  // Horarios estructurados
  daysOfWeek = [
    { name: 'Lunes',     slug: 'lun', open: '08:00', close: '20:00', closed: false },
    { name: 'Martes',    slug: 'mar', open: '08:00', close: '20:00', closed: false },
    { name: 'Miércoles', slug: 'mie', open: '08:00', close: '20:00', closed: false },
    { name: 'Jueves',    slug: 'jue', open: '08:00', close: '20:00', closed: false },
    { name: 'Viernes',   slug: 'vie', open: '08:00', close: '20:00', closed: false },
    { name: 'Sábado',    slug: 'sab', open: '09:00', close: '18:00', closed: false },
    { name: 'Domingo',   slug: 'dom', open: '09:00', close: '18:00', closed: false },
  ];

  // Formulario Maestro
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
    
    // Hotel
    stars:               0,
    accommodation_type:  '',
    house_rules:         '',
    cancellation_policy: '',

    // Attraction
    slogan:              '',
    opening_hours:       '',
    best_time:           '',
    price_adult:         0,
    price_child:         0,
    price_local:         0,
    estimated_duration:  '',

    // Restaurant
    price_range:         1,
    featured_dish:       '',
    menu_url:            '',
    requires_reservation: false,
    capacity:            0,
    stay_time:           '',
    delivery:            false,
    pickup:              false
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
    console.log('🔄 Cargando amenidades para cat:', catId);
    this.placesService.getAmenities(catId).subscribe({
      next: (data) => {
        console.log('✅ Amenidades recibidas:', data.length);
        this.amenities = data;
        this.groupAmenities();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando amenidades:', err);
      }
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
    this.isModalOpen = true;
    this.showSelectionStep = true;
    this.cdr.detectChanges();
  }

  selectCategory(catId: number): void {
    this.form.category_id = catId;
    this.showSelectionStep = false;
    this.activeTab = 'identificacion';
    
    // Cargar amenidades específicas de esta categoría
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
      capacity: 0, stay_time: '', delivery: false, pickup: false
    };
    this.galleryPreviews = [];
    this.successMessage = '';
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

    this.placesService.createPlace(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = '¡Negocio registrado con éxito! Pendiente de aprobación.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        alert('Error: ' + (err.error?.error || 'No se pudo guardar'));
      }
    });
  }

  getCategoryLabel(id: number): string {
    return this.categories.find(c => c.id === Number(id))?.label || '-';
  }
}
