import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacesService } from '../../../services/places';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  stats = {
    totalPlaces: 0,
    activePlaces: 0,
    pendingPlaces: 0,
    totalUsers: 0
  };

  allPlaces: any[] = [];
  searchQuery: string = '';
  filterCategory: number = 0; // 0 = Todas
  selectedPlace: any = null;
  isModalOpen = false;

  constructor(
    private placesService: PlacesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.placesService.getAll().subscribe({
      next: (data: any) => {
        this.allPlaces = Array.isArray(data) ? data : (data?.places ? data.places : []);
        this.calculateStats();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando datos dashboard:', err)
    });
  }

  calculateStats(): void {
    this.stats.totalPlaces = this.allPlaces.length;
    this.stats.activePlaces = this.allPlaces.filter(p => p.status === 'APPROVED' && p.is_active).length;
    this.stats.pendingPlaces = this.allPlaces.filter(p => p.status === 'PENDING').length;
    this.stats.totalUsers = [...new Set(this.allPlaces.map(p => p.owner_id))].length;
  }

  // --- Getters Filtrados para las Tablas ---

  getFilteredPending(): any[] {
    return this.applyFilters(this.allPlaces.filter(p => p.status === 'PENDING'));
  }

  getFilteredActive(): any[] {
    return this.applyFilters(this.allPlaces.filter(p => p.status === 'APPROVED' && p.is_active));
  }

  getFilteredInactive(): any[] {
    return this.applyFilters(this.allPlaces.filter(p => p.status === 'REJECTED' || (p.status === 'APPROVED' && !p.is_active)));
  }

  private applyFilters(list: any[]): any[] {
    return list.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            (p.address && p.address.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchesCategory = this.filterCategory === 0 || p.category_id === Number(this.filterCategory);
      return matchesSearch && matchesCategory;
    });
  }

  updatePlaceStatus(id: number, status: string, isActive: boolean): void {
    const actionLabel = status === 'REJECTED' ? 'RECHAZAR' : (isActive ? 'ACTIVAR/APROBAR' : 'DESACTIVAR');
    const isConfirmed = confirm(`¿Estás seguro de que deseas ${actionLabel} este negocio?`);
    
    if (!isConfirmed) return;

    this.placesService.updateStatus(id, status, isActive).subscribe({
      next: () => {
        this.loadData(); // Recargar todo para que se muevan de tabla
      },
      error: (err) => alert('Error al actualizar estado')
    });
  }

  openReview(place: any) {
    this.selectedPlace = place;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedPlace = null;
  }

  approvePlace() {
    if (!this.selectedPlace) return;
    this.placesService.updateStatus(this.selectedPlace.id, 'APPROVED', true).subscribe({
      next: () => {
        this.closeModal();
        this.loadData();
      }
    });
  }

  rejectPlace() {
    if (!this.selectedPlace) return;
    this.placesService.updateStatus(this.selectedPlace.id, 'REJECTED', false).subscribe({
      next: () => {
        this.closeModal();
        this.loadData();
      }
    });
  }

  getCategoryLabel(id: number): string {
    const cats: any = { 1: 'Hotel', 2: 'Restaurante', 3: 'Zona Turística' };
    return cats[id] || 'Otro';
  }

  getCategoryEmoji(id: number): string {
    const emojis: any = { 1: '🏨', 2: '🍽️', 3: '🌴' };
    return emojis[id] || '📍';
  }
}
