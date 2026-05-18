
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const publicGuard = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/home']);
    return false;
  }
  return true;
};

export const hasPrivilege = (route: ActivatedRouteSnapshot) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredPrivilege = route.data['privilege'] as string;

  if (!requiredPrivilege) {
    return true;
  }

  if (authService.hasPrivilege(requiredPrivilege)) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};