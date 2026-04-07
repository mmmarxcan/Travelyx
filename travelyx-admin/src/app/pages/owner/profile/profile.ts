import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class OwnerProfile implements OnInit {
  ownerName  = '';
  ownerEmail = '';

  oldPassword     = '';
  newPassword     = '';
  confirmPassword = '';
  isSaving = false;
  message  = '';
  isError  = false;

  constructor(private auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.ownerName  = this.auth.getFullName();
    this.ownerEmail = this.auth.getEmail();
  }

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.showMessage('Por favor completa todos los campos.', true);
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showMessage('Las contraseñas nuevas no coinciden.', true);
      return;
    }
    if (this.newPassword.length < 6) {
      this.showMessage('La contraseña debe tener al menos 6 caracteres.', true);
      return;
    }

    this.isSaving = true;

    this.http.post('http://localhost:3000/api/auth/change-password', {
      email:       this.ownerEmail,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.oldPassword = this.newPassword = this.confirmPassword = '';
        this.showMessage('¡Contraseña actualizada correctamente!', false);
      },
      error: (err) => {
        this.isSaving = false;
        this.showMessage(err.error?.error || 'Error al cambiar la contraseña.', true);
      }
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
    setTimeout(() => this.message = '', 5000);
  }
}
