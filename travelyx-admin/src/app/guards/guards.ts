import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isSuperAdmin()) return true;
  if (auth.isOwner()) return router.createUrlTree(['/owner']);
  return router.createUrlTree(['/login']);
};

export const ownerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isOwner()) return true;
  if (auth.isSuperAdmin()) return router.createUrlTree(['/dashboard']);
  return router.createUrlTree(['/login']);
};
