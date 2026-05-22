import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class City {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/app-back/public/api/cities';

  getCities(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createCity(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCity(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCity(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCitiesByState(stateId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-by-state/${stateId}`);
  }
}