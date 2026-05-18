
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RolePrivilegeService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost/app-back/public/api/role-privileges';

    getRolePrivileges(roleId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${roleId}`);
    }

    assignPrivileges(roleId: string, privilegeIds: string[]): Observable<any> {
        const data = {
            roleId: roleId,
            privilegeId: JSON.stringify(privilegeIds)
        };
        return this.http.post(this.apiUrl, data);
    }
}