import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Person {
  private http = inject(HttpClient);

  private apiUrl = "http://localhost/app-back/public/api/peoples";
  private apiComunity = 'http://localhost/app-back/public/api/comunities';
  private apiCouncil = 'http://localhost/app-back/public/api/councils';
  private apiCommitte = 'http://localhost/app-back/public/api/committees';
  private apiCities = 'http://localhost/app-back/public/api/cities';
  private apiRoles = 'http://localhost/app-back/public/api/roles';

  getPeoples(): Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }
  
  searchPeople(data:string): Observable<any>{
    const params = new HttpParams().set('firstName', data);
    return this.http.get<any>(`${this.apiUrl}/search`,{ params } );
  }
  
  assignRoles(id: string, roles: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/roles`, { roles });
  }

  deletePerson(id:string):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(id:string, formData:FormData):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/${id}/photo`, formData);
  }

  getPersonById(id:string):Observable <any>{
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createPerson(data:any):Observable<any>{
    return this.http.post(this.apiUrl, data);
  }

  getComunity():Observable<any>{
    return this.http.get(this.apiComunity);
  }

  getCouncil():Observable<any>{
    return this.http.get(this.apiCouncil);
  }

  getCommitte():Observable<any>{
    return this.http.get(this.apiCommitte);
  }

  getCity():Observable<any>{
    return this.http.get(this.apiCities);
  }

  updatePerson(id:string, data:any):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  getRoles():Observable<any>{
    return this.http.get<any>(`${this.apiRoles}`);
  }

  getCouncilsByComunity(comunityId: string): Observable<any> {
    return this.http.get<any>(`${this.apiCouncil}/bycomunity/${comunityId}`);
  }

  getSubcommittees(parentId:string):Observable<any>{
    return this.http.get<any>(`${this.apiCommitte}/subCommittees/${parentId}`);
  }

  updateOwnProfile(data: any): Observable<any> {
    console.log('updateOwnProfile llamado con:', data);
    return this.http.post(`${this.apiUrl}/update-own`, data);
}

uploadOwnPhoto(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-photo-own`, formData);
}
}