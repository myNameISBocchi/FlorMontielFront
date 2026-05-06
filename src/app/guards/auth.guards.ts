import { inject } from '@angular/core';
import { Router } from '@angular/router';
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