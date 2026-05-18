import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Country {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/app-back/public/api/countries';

  getCountries(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createCountry(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCountry(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCountry(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}