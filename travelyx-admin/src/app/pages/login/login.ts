import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { API_BASE_URL } from '../../config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnDestroy {
  email = '';
  password = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;
  mustChangePassword = false;

  // Variables para bloqueo de seguridad
  isLocked = false;
  countdownText = '';
  lockoutDate: Date | null = null;
  private timerInterval: any;

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

    this.http.post<any>(`${API_BASE_URL}/auth/login`, {
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
        if (err.status === 403 && err.error?.code === 'ACCOUNT_LOCKED') {
          this.isLocked = true;
          this.lockoutDate = new Date(err.error.locked_until);
          this.startLockoutTimer();
          this.errorMessage = err.error.error || 'Cuenta bloqueada.';
          this.cdr.detectChanges();
          return;
        }
        const msg = err.error?.error || 'Correo o contraseña incorrectos';
        this.errorMessage = msg;
        this.cdr.detectChanges();
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

    this.http.post<any>(`${API_BASE_URL}/auth/change-password`, {
      email:       this.email,
      oldPassword: this._tempPassword,   // usamos la guardada internamente
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        // Re-login automático con la nueva contraseña
        this.http.post<any>(`${API_BASE_URL}/auth/login`, {
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

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startLockoutTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.updateCountdown();
    this.timerInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    if (!this.lockoutDate) return;
    const now = new Date();
    const diff = this.lockoutDate.getTime() - now.getTime();

    if (diff <= 0) {
      clearInterval(this.timerInterval);
      this.isLocked = false;
      this.countdownText = '';
      this.errorMessage = '';
      this.cdr.detectChanges();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    this.countdownText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    this.cdr.detectChanges();
  }

  resetLockout() {
    if (!this.email) {
      alert('Ingresa tu correo primero para desbloquearlo.');
      return;
    }
    
    this.isLoading = true;
    this.http.post<any>(`${API_BASE_URL}/auth/reset-lockout`, { email: this.email }).subscribe({
      next: (res) => {
        alert(res.message);
        this.isLocked = false;
        this.countdownText = '';
        this.errorMessage = '';
        this.isLoading = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al desbloquear');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
