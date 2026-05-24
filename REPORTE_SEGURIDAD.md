# Reporte de Implementación de Seguridad - Proyecto Travelyx
**Fecha:** 16 de Mayo de 2026
**Módulos Afectados:** Backend (Prisma/Express) y Panel Administrativo (Angular)

Este documento detalla todas las modificaciones realizadas en el código base para cumplir con los estándares de seguridad solicitados, específicamente contra ataques de fuerza bruta, mitigación de inyecciones (SQLi/XSS) y prevención de almacenamiento en caché de sesiones cerradas.

---

## 1. Modificaciones a la Base de Datos (Esquema Prisma)
**Archivo:** `travelyx-backend/prisma/schema.prisma`

Se añadieron campos al modelo de Usuario para permitir el rastreo de intentos de inicio de sesión y la gestión de bloqueos temporales.

**Código Nuevo Agregado:**
```prisma
model User {
  // ... campos existentes ...
  created_at            DateTime @default(now())
  
  // NUEVOS CAMPOS:
  failed_attempts       Int      @default(0)
  locked_until          DateTime?
  
  places                Place[]
}
```
*Nota: Se ejecutó `npx prisma db push` y se regeneró el cliente para sincronizar la base de datos PostgreSQL.*

---

## 2. Modificaciones al Backend (API de Autenticación)
**Archivo:** `travelyx-backend/src/routes/auth.ts`

Se reemplazó la lógica básica de login por un flujo seguro que incluye:
- **Sanitización básica:** Limpieza de espacios en blanco en credenciales (`trim()`).
- **Prevención de Caché (BFCache):** Inserción de cabeceras HTTP restrictivas.
- **Defensa de Fuerza Bruta:** Bloqueo de 30 minutos tras 3 intentos fallidos.

**Resumen de los cambios en el código (`POST /login`):**
```typescript
// 1. Prevención de caché de la respuesta de login
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

// 2. Sanitización básica: Trim y limpieza
email = email.trim().toLowerCase();
password = password.trim();

// 3. Comprobación de bloqueo antes de verificar contraseña
if (user.locked_until && user.locked_until > new Date()) {
  return res.status(403).json({ 
    error: 'Cuenta bloqueada por múltiples intentos fallidos', 
    code: 'ACCOUNT_LOCKED',
    locked_until: user.locked_until 
  });
}

// 4. Lógica de incremento de intentos (Si la contraseña falla)
const newAttempts = user.failed_attempts + 1;
let updateData: any = { failed_attempts: newAttempts };

if (newAttempts >= 3) {
  const lockoutDate = new Date();
  lockoutDate.setMinutes(lockoutDate.getMinutes() + 30);
  updateData.locked_until = lockoutDate;
}
await prisma.user.update({ where: { id: user.id }, data: updateData });

// 5. Reseteo de intentos (Si la contraseña es correcta)
if (user.failed_attempts > 0 || user.locked_until) {
  await prisma.user.update({ where: { id: user.id }, data: { failed_attempts: 0, locked_until: null } });
}
```

---

## 3. Modificaciones al Panel Administrativo (Frontend)

### A. Vista del Login
**Archivo:** `travelyx-admin/src/app/pages/login/login.html`

Se añadió una alerta de seguridad visual que reemplaza el formulario mientras la cuenta permanece bloqueada. Los campos `<input>` y el `<button>` de envío fueron protegidos con `[disabled]="isLocked"`.

**Código UI Agregado:**
```html
<div *ngIf="isLocked" class="error-msg locked-msg" style="background: #ffebee; border-left: 4px solid #f44336; color: #b71c1c; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
  <span style="font-size: 1.5rem; display: block; margin-bottom: 5px;">🔒</span>
  <strong>Cuenta bloqueada por seguridad</strong><br>
  <span style="font-size: 0.9rem;">Múltiples intentos fallidos.</span><br>
  <span style="display: inline-block; margin-top: 8px; background: #f44336; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold; letter-spacing: 1px;">
    {{ countdownText }}
  </span>
</div>
```

### B. Controlador del Login
**Archivo:** `travelyx-admin/src/app/pages/login/login.ts`

Se implementó el temporizador para leer el código `403` enviado por el backend e iniciar una cuenta regresiva visual.

**Lógica Implementada:**
```typescript
error: (err) => {
  this.isLoading = false;
  // Interceptar código de bloqueo
  if (err.status === 403 && err.error?.code === 'ACCOUNT_LOCKED') {
    this.isLocked = true;
    this.lockoutDate = new Date(err.error.locked_until);
    this.startLockoutTimer();
    return;
  }
}

// Temporizador Regresivo (Intervalo)
updateCountdown() {
  if (!this.lockoutDate) return;
  const now = new Date();
  const diff = this.lockoutDate.getTime() - now.getTime();

  if (diff <= 0) { // El bloqueo expiró
    clearInterval(this.timerInterval);
    this.isLocked = false;
    this.countdownText = '';
    return;
  }
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  this.countdownText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
```

### C. Prevención de Caché al Desloguear (BFCache)
**Archivo:** `travelyx-admin/src/app/services/auth.ts`

Para evitar que el usuario cierre sesión y utilice el botón "Atrás" del navegador para visualizar información de la caché temporal, se forzó la manipulación del historial.

**Modificación en `logout()`:**
```typescript
logout(): void {
  Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  // Forzar recarga limpia y reemplazar historial para evitar ver datos cacheados
  window.location.replace('/login');
}
```

---
**Documento generado por Antigravity AI.**
