import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class State {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/app-back/public/api/states';

  getStates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createState(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateState(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteState(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStatesByCountry(countryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-by-country/${countryId}`);
  }
}