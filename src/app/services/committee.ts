import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Committee {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost/app-back/public/api/committees';

  getCommittee():Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }

  createCommittee(data:any):Observable<any>{
    return this.http.post<any>(this.apiUrl,data);
  }

  updateCommittee(id:string, data:any):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteCommitte(id:string):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}
