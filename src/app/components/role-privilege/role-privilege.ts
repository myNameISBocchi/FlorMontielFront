import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role';
import { PrivilegeService } from '../../services/privilege';
import { RolePrivilegeService } from '../../services/role-privilege';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-privilege',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-privilege.html',
  styleUrl: './role-privilege.css',
})
export class RolePrivilege implements OnInit {
  roles: any[] = [];
  privileges: any[] = [];
  selectedRoleId: string = '';
  selectedRoleName: string = '';
  assignedPrivileges: string[] = [];
  loading: boolean = false;
  saving: boolean = false;
  public authService = inject(Auth);

  constructor(
    private roleService: RoleService,
    private privilegeService: PrivilegeService,
    private rolePrivilegeService: RolePrivilegeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPrivileges();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.results || res;
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los roles', 'error')
    });
  }

  loadPrivileges(): void {
    this.privilegeService.getPrivileges().subscribe({
      next: (res: any) => {
        this.privileges = res.results || res;
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los privilegios', 'error')
    });
  }

  onRoleChange(): void {
    if (this.selectedRoleId) {
      const selected = this.roles.find(r => r.roleId === this.selectedRoleId);
      this.selectedRoleName = selected?.roleName || '';
      this.loadRolePrivileges();
    } else {
      this.assignedPrivileges = [];
      this.loading = false;
    }
  }

  loadRolePrivileges(): void {
    this.loading = true;
    this.assignedPrivileges = [];
    
    this.rolePrivilegeService.getRolePrivileges(this.selectedRoleId).subscribe({
      next: (response: any) => {
        let results = [];
        if (response && response.results) {
          results = response.results;
        } else if (response && Array.isArray(response)) {
          results = response;
        }
        
        if (results && results.length > 0) {
          this.assignedPrivileges = results.map((item: any) => item.privilegeId);
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.assignedPrivileges = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isPrivilegeAssigned(privilegeId: string): boolean {
    return this.assignedPrivileges.includes(privilegeId);
  }

  togglePrivilege(privilegeId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.assignedPrivileges.includes(privilegeId)) {
        this.assignedPrivileges.push(privilegeId);
      }
    } else {
      const index = this.assignedPrivileges.indexOf(privilegeId);
      if (index > -1) {
        this.assignedPrivileges.splice(index, 1);
      }
    }
  }

  saveAssignments(): void {
    if (!this.selectedRoleId) {
      Swal.fire('Error', 'Seleccione un rol primero', 'warning');
      return;
    }

    this.saving = true;
    this.rolePrivilegeService.assignPrivileges(this.selectedRoleId, this.assignedPrivileges).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Privilegios asignados correctamente', 'success');
        this.saving = false;
        this.loadRolePrivileges();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.msg || 'Error al asignar privilegios', 'error');
        this.saving = false;
      }
    });
  }

  selectAll(): void {
    this.assignedPrivileges = this.privileges.map(p => p.privilegeId);
  }

  deselectAll(): void {
    this.assignedPrivileges = [];
  }
}