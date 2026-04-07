import { Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { PlacesService } from '../../../services/places';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './places.html',
  styleUrl: './places.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Places implements OnInit, AfterViewInit {
  private map: any;
  places: any[] = [];
  selectedPlace: any = null;
  isEditing = false;
  
  constructor(
    private placesService: PlacesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.placesService.getAll().subscribe({
      next: (data: any) => {
        const receivedData = Array.isArray(data) ? data : (data?.places ? data.places : []);
        this.places = receivedData;
        console.log('📍 Lugares cargados en mapa:', this.places.length);
        
        if (this.map) {
          this.renderMarkers();
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar lugares:', err)
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }


  private initMap(): void {
    this.map = L.map('map-fullscreen', {
      center: [21.2844, -89.6644],
      zoom: 15,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.renderMarkers();
  }

  public toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  public saveChanges(): void {
    if (!this.selectedPlace) return;

    this.placesService.update(this.selectedPlace.id, this.selectedPlace).subscribe({
      next: () => {
        alert('✅ Negocio actualizado con éxito');
        this.isEditing = false;
        this.loadPlaces(); // Recargar datos y refrescar marcadores
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        alert('❌ Error al guardar los cambios. Revisa la consola.');
      }
    });
  }

  public getCategoryColor(categoryId: number): string {
    const colors: any = {
      1: '#10B981', // Hotel - Esmeralda
      2: '#F59E0B', // Restaurante - Ámbar
      3: '#3B82F6', // Zona Turística - Azul
    };
    return colors[categoryId] || '#6B7280';
  }

  public getStatusColor(status: any): string {
    if (status === 'APPROVED' || status === true) return '#10B981';
    if (status === 'REJECTED') return '#EF4444';
    return '#F59E0B'; // PENDING
  }

  private renderMarkers(): void {
    // Limpiar marcadores existentes
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });

    this.places.forEach(place => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = this.selectedPlace?.id === place.id;
      const size = isSelected ? 30 : 20;
      const catColor = this.getCategoryColor(place.category_id);

      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          className: `custom-marker ${isSelected ? 'selected-marker' : ''}`,
          html: `<div style="background-color: ${catColor}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 ${isSelected ? '15px 5px' : '10px 0'} ${catColor}cc;"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        })
      }).addTo(this.map);

      marker.on('click', () => {
        this.selectPlace(place);
      });

      marker.on('dragend', (event: any) => {
        const position = event.target.getLatLng();
        place.lat = position.lat;
        place.lng = position.lng;
        // Si el lugar está seleccionado, actualizar la vista lateral
        if (this.selectedPlace?.id === place.id) {
          this.selectedPlace.lat = position.lat;
          this.selectedPlace.lng = position.lng;
          this.cdr.detectChanges(); // Forzamos actualización de los inputs en el HTML
        }
      });
    });
  }

  public selectPlace(place: any): void {
    this.selectedPlace = { ...place };
    this.isEditing = false;
    this.map.setView([place.lat, place.lng], 16);
    this.renderMarkers(); // Re-renderizamos para que el seleccionado se resalte
  }
}
