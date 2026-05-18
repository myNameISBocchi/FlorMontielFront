import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrivilegeService } from '../../services/privilege';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-privilege',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './privilege.html',
  styleUrl: './privilege.css',
})
export class Privilege implements OnInit {
  privileges: any[] = [];
  filteredPrivileges: any[] = [];
  currentPrivilege: any = { privilegeName: '', route: '' };
  isEditing: boolean = false;
  showModal: boolean = false;
  public authService = inject(Auth);
  pagedPrivileges: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pagesArray: number[] = [];

  constructor(private privilegeService: PrivilegeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPrivileges();
  }

  loadPrivileges(): void {
    this.privilegeService.getPrivileges().subscribe({
      next: (res: any) => {
        this.privileges = res.results || res;
        this.filteredPrivileges = [...this.privileges];
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los privilegios', 'error');
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredPrivileges.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPrivileges = this.filteredPrivileges.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  openModal(privilege?: any): void {
    if (privilege) {
      this.currentPrivilege = { ...privilege };
      this.isEditing = true;
    } else {
      this.currentPrivilege = { privilegeName: '', route: '' };
      this.isEditing = false;
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPrivilege = { privilegeName: '', route: '' };
  }

  savePrivilege(): void {
    const privilegeName = this.currentPrivilege.privilegeName?.trim().toUpperCase();
    const route = this.currentPrivilege.route?.trim().toLowerCase();
    
    if (!privilegeName || !route) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }

    this.currentPrivilege.privilegeName = privilegeName;
    this.currentPrivilege.route = route;
    this.currentPrivilege.status = 1;

    if (this.isEditing && this.currentPrivilege.privilegeId) {
      this.privilegeService.updatePrivilege(this.currentPrivilege.privilegeId, this.currentPrivilege).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Privilegio actualizado correctamente', 'success');
          this.loadPrivileges();
          this.closeModal();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al actualizar', 'error');
        }
      });
    } else {
      this.privilegeService.createPrivilege(this.currentPrivilege).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Privilegio creado correctamente', 'success');
          this.loadPrivileges();
          this.closeModal();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al crear el privilegio', 'error');
        }
      });
    }
  }

  deletePrivilege(privilege: any): void {
    if (privilege.blocked) {
      Swal.fire('No se puede eliminar', 'Este privilegio está asignado a un rol', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Eliminar privilegio?',
      text: `¿Estás seguro de eliminar "${privilege.privilegeName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && privilege.privilegeId) {
        this.privilegeService.deletePrivilege(privilege.privilegeId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Privilegio eliminado correctamente', 'success');
            this.loadPrivileges();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.msg || 'Error al eliminar', 'error');
          }
        });
      }
    });
  }
}