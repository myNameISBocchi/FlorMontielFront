import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Comunity {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost/app-back/public/api/comunities";

  getComunity(){
    return this.http.get<any[]>(this.apiUrl);
  }
  
  createComunity(data:any){
    return this.http.post(this.apiUrl, data);
  }

  deleteComunity(id:number){
    return this.http.delete(`${this.apiUrl}/${id}`);

  }

  updateComunity(id:number, data:any){
    return this.http.put(`${this.apiUrl}/${id}`, data);

  }

  updatePhoto(id:number,photo:FormData){
    return this.http.post(`${this.apiUrl}/${id}/photo`, photo);

  }
}