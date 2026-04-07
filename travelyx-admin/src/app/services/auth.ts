import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly KEYS = {
    token:     'travelyx_token',
    userId:    'travelyx_user_id',
    role:      'travelyx_role',
    fullName:  'travelyx_full_name',
    email:     'travelyx_email',
  };

  // ── Guardar sesión ────────────────────────────────────────────
  saveSession(token: string, user: { id: number; email: string; full_name: string | null; role: string }): void {
    localStorage.setItem(this.KEYS.token,    token);
    localStorage.setItem(this.KEYS.userId,   String(user.id));
    localStorage.setItem(this.KEYS.role,     user.role);
    localStorage.setItem(this.KEYS.fullName, user.full_name || '');
    localStorage.setItem(this.KEYS.email,    user.email);
  }

  // ── Limpiar sesión ────────────────────────────────────────────
  logout(): void {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  }

  // ── Getters ───────────────────────────────────────────────────
  getToken():    string | null { return localStorage.getItem(this.KEYS.token); }
  getRole():     string | null { return localStorage.getItem(this.KEYS.role); }
  getUserId():   number | null {
    const id = localStorage.getItem(this.KEYS.userId);
    return id ? Number(id) : null;
  }
  getFullName(): string        { return localStorage.getItem(this.KEYS.fullName) || ''; }
  getEmail():    string        { return localStorage.getItem(this.KEYS.email) || ''; }

  isLoggedIn():    boolean { return !!this.getToken(); }
  isSuperAdmin():  boolean { return this.getRole() === 'SUPERADMIN'; }
  isOwner():       boolean { return this.getRole() === 'OWNER'; }
}
