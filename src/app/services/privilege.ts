import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Privilege {
    privilegeId?: string;
    privilegeName: string;
    route: string;
    status?: number;
    blocked?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PrivilegeService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost/app-back/public/api/privileges';

    getPrivileges(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    createPrivilege(data: Privilege): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    updatePrivilege(id: string, data: Privilege): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    deletePrivilege(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}