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

export const hasRole = (route: ActivatedRouteSnapshot) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if(!authService.isLoggedIn()){
    router.navigate(['/login']);
    return false;
  }

  const personRole = authService.getRole();
  const allowedRoles = route.data['roles'] as Array<string>;

  if(allowedRoles.includes(personRole)){
    return true;
  }

  router.navigate(['/home']);
  return false;

}