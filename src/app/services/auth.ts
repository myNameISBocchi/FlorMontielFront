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

        console.log('Respuesta Login:', response);
        if (response && response.results && response.results[0]) {
          const userData = response.results[0];
          if (userData.token) {
            localStorage.setItem('auth_token', userData.token);
          }
          if (userData.personId) {
            localStorage.setItem('personId', userData.personId.toString());
          }
          if (userData.user && userData.user.roles && userData.user.roles.length > 0) {
          localStorage.setItem('personRole', userData.user.roles[0]);
        } else {
          localStorage.setItem('personRole', 'SIN_ROL');
        }
          console.log('Token y PersonId guardados correctamente');
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
    this.router.navigate(['/login']);
  }

  getRole():string{
    return localStorage.getItem('personRole') || '';
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getPersonId(): string | null {
    return localStorage.getItem('personId');
  }
}