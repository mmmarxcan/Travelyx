import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  adminProfile = {
    name: 'Super Admin Travelyx',
    email: 'admin@travelyx.com',
    password: '••••••••'
  };

  kioskConfig = {
    welcomeMessage: '¡Bienvenido a Progreso!',
    cityName: 'Progreso, Yucatán',
    maintenanceMode: false,
    showMascot: true
  };

  saveProfile(): void {
    alert('Perfil actualizado con éxito');
  }

  saveKioskConfig(): void {
    alert('Configuración del Kiosko enviada a los terminales');
  }
}
