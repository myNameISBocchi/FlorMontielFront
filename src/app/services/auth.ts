// src/app/services/auth.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = "http://localhost/app-back/public/api";

  constructor(private http: HttpClient, private router: Router) {}
  
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/loggin`, credentials).pipe(
      tap((response: any) => {
        console.log('RESPUESTA COMPLETA DEL LOGIN:', response);
        if (response && response.results && response.results[0]) {
          const userData = response.results[0];
          
          if (userData.token) {
            localStorage.setItem('auth_token', userData.token);
          }
          
          if (userData.personId) {
            localStorage.setItem('personId', userData.personId.toString());
          }
          if (userData.user && userData.user.roles) {
            localStorage.setItem('personRoles', JSON.stringify(userData.user.roles));
            
            localStorage.setItem('personRole', userData.user.roles[0] || 'SIN_ROL');
          } else {
            localStorage.setItem('personRoles', JSON.stringify([]));
            localStorage.setItem('personRole', 'SIN_ROL');
          }
          
          if (userData.user && userData.user.privileges) {
            localStorage.setItem('userPrivileges', JSON.stringify(userData.user.privileges));
          } else {
            localStorage.setItem('userPrivileges', JSON.stringify([]));
          }
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token') && !!localStorage.getItem('personId');
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('personId');
    localStorage.removeItem('personRole');
    localStorage.removeItem('personRoles');
    localStorage.removeItem('userPrivileges');
    this.router.navigate(['/login']);
  }


  getRole(): string {
    return localStorage.getItem('personRole') || '';
  }

  
  getRoles(): string[] {
    const roles = localStorage.getItem('personRoles');
    return roles ? JSON.parse(roles) : [];
  }

  
  hasRole(roleName: string): boolean {
    return this.getRoles().includes(roleName);
  }

 
  hasAnyRole(roleNames: string[]): boolean {
    const userRoles = this.getRoles();
    return roleNames.some(role => userRoles.includes(role));
  }

  
  hasPrivilege(route: string): boolean {
    const privileges = localStorage.getItem('userPrivileges');
    if (!privileges) return false;
    const userPrivileges = JSON.parse(privileges);
    return userPrivileges.includes(route);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getPersonId(): string | null {
    return localStorage.getItem('personId');
  }
}