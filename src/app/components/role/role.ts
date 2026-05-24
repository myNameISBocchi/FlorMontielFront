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
  filteredRoles: any[] = [];
  currentRole: any = { roleName: '' };
  isEditing: boolean = false;
  showModal: boolean = false;
  public authService = inject(Auth);
  pagedRoles: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pagesArray: number[] = [];
  searchTerm: string = '';

  constructor(private roleService: RoleService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.results || res;
        this.filteredRoles = [...this.roles];
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    });
  }

  filterRoles(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredRoles = this.roles.filter(role => 
        role.roleName?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterRoles();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredRoles.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedRoles = this.filteredRoles.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
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

    if (this.isEditing && this.currentRole.roleId) {
        const updateData = { roleName: roleName };
        
        this.roleService.updateRole(this.currentRole.roleId, updateData).subscribe({
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
        this.roleService.createRole({ roleName: roleName }).subscribe({
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