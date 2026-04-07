import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;
  mustChangePassword = false;

  // Guardamos la contraseña temporal internamente para no perderla
  private _tempPassword = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:3000/api/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.user.must_change_password) {
          // Guardamos la contraseña temporal internamente (no perder la referencia)
          this._tempPassword = this.password;
          this.newPassword = '';
          this.confirmPassword = '';
          this.mustChangePassword = true;
          this.errorMessage = '';
          this.cdr.detectChanges(); // Forzar actualización de UI
          return;
        }

        this.auth.saveSession(response.token, response.user);
        this.redirectByRole(response.user.role);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.error || 'Correo o contraseña incorrectos';
        this.errorMessage = msg;
        this.cdr.detectChanges();
        alert('Error: ' + msg);
      }
    });
  }

  onChangePassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa los dos campos';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:3000/api/auth/change-password', {
      email:       this.email,
      oldPassword: this._tempPassword,   // usamos la guardada internamente
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        // Re-login automático con la nueva contraseña
        this.http.post<any>('http://localhost:3000/api/auth/login', {
          email:    this.email,
          password: this.newPassword
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.auth.saveSession(response.token, response.user);
            this.redirectByRole(response.user.role);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.isLoading = false;
            const msg = err.error?.error || 'Contraseña cambiada. Por favor inicia sesión manualmente.';
            this.errorMessage = msg;
            this.cdr.detectChanges();
            alert('Aviso: ' + msg);
            this.mustChangePassword = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.error || 'Error al cambiar contraseña. Verifica tus datos.';
        this.errorMessage = msg;
        this.cdr.detectChanges();
        alert('Error: ' + msg);
      }
    });
  }

  private redirectByRole(role: string) {
    if (role === 'SUPERADMIN') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'OWNER') {
      this.router.navigate(['/owner']);
    }
  }
}
