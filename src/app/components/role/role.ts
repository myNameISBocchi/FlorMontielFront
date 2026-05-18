import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role.html',
  styleUrl: './role.css',
})
export class Role implements OnInit {
  roles: any[] = [];
  currentRole: any = { roleName: '' };
  isEditing: boolean = false;
  showModal: boolean = false;
  public authService = inject(Auth);

  constructor(private roleService: RoleService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.results || res;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    });
  }

  openModal(role?: any): void {
    if (role) {
      this.currentRole = { ...role };
      this.isEditing = true;
    } else {
      this.currentRole = { roleName: '' };
      this.isEditing = false;
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentRole = { roleName: '' };
  }

  saveRole(): void {
    const roleName = this.currentRole.roleName?.trim().toUpperCase();
    
    if (!roleName) {
      Swal.fire('Error', 'El nombre del rol es obligatorio', 'error');
      return;
    }

    this.currentRole.roleName = roleName;

    if (this.isEditing && this.currentRole.roleId) {
      this.roleService.updateRole(this.currentRole.roleId, this.currentRole).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
          this.loadRoles();
          this.closeModal();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al actualizar', 'error');
        }
      });
    } else {
      this.roleService.createRole(this.currentRole).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Rol creado correctamente', 'success');
          this.loadRoles();
          this.closeModal();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al crear el rol', 'error');
        }
      });
    }
  }

  deleteRole(role: any): void {
    if (role.blocked) {
      Swal.fire('No se puede eliminar', 'Este rol está en uso', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Eliminar rol?',
      text: `¿Estás seguro de eliminar "${role.roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && role.roleId) {
        this.roleService.deleteRole(role.roleId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Rol eliminado correctamente', 'success');
            this.loadRoles();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.msg || 'Error al eliminar', 'error');
          }
        });
      }
    });
  }
}