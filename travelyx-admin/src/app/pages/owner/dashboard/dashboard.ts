import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { PlacesOwnerService } from '../../../services/places-owner';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class OwnerDashboard implements OnInit {
  ownerName = '';
  places: any[] = [];
  activePlaces = 0;
  pendingPlaces = 0;

  constructor(
    private auth: AuthService,
    private placesService: PlacesOwnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ownerName = this.auth.getFullName() || 'Propietario';
    const ownerId = this.auth.getUserId();
    if (ownerId) {
      this.placesService.getMyPlaces(ownerId).subscribe({
        next: (data: any[]) => {
          const receivedData = data || [];
          this.places       = receivedData;
          this.activePlaces  = receivedData.filter(p => p.status === 'APPROVED' && p.is_active).length;
          this.pendingPlaces = receivedData.filter(p => p.status === 'PENDING').length;
          this.cdr.detectChanges(); // Forzamos refresco de la UI
        },
        error: (err) => console.error('Error cargando dashboard propietario:', err)
      });
    }
  }
}
