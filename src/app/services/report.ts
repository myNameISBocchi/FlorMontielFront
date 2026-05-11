import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/app-back/public/api/reporte/voceros';

  imprimirVoceros(filters: any = {}): Observable<Blob> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(this.apiUrl, {
      params,
      responseType: 'blob'
    });
  }
}