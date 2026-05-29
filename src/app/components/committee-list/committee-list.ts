import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Committee } from '../../services/committee';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-committee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './committee-list.html',
  styleUrl: './committee-list.css',
})
export class CommitteeList implements OnInit {
  private committeeService = inject(Committee);
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(Auth);

  committees: any[] = [];
  filteredCommittees: any[] = [];
  searchTerm: string = '';
  pagedCommittees: any[] = [];
  currentPage: number = 1;
  perPage: number = 6;
  totalPages: number = 1;
  isLoading = true;

  committeeForm = {
    committeeId: '',
    committeeName: '',
    parentId: null as string | null
  };

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.isLoading = true;
    this.committeeService.getCommittee().subscribe({
      next: (res) => {
        this.committees = res.result;
        this.filteredCommittees = [...this.committees];
        this.updatePagination();
        this.currentPage = 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'Error al cargar comités', 'error');
        this.isLoading = false;
      }
    });
  }

  onSearch() {
  const term = this.searchTerm.trim().toLowerCase();
  
  if (!term) {
    this.filteredCommittees = [...this.committees];
  } else {
    this.filteredCommittees = this.committees.filter(item => {
      return item.committeeName?.toLowerCase().includes(term);
    });
  }
  
  this.currentPage = 1;
  this.updatePagination();
  this.cdr.detectChanges();
}
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCommittees.length / this.perPage);
    const startIndex = (this.currentPage - 1) * this.perPage;
    const endIndex = startIndex + this.perPage;
    this.pagedCommittees = this.filteredCommittees.slice(startIndex, endIndex);
  }

  goTopage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  createCommittee(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const nameValue = (formData.get('committeeName') as string || '').trim();
    const parentValue = formData.get('parentId') ? String(formData.get('parentId')) : null;

    const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\(\)]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\(\)]+)*$/;

    if (!nameValue) {
      Swal.fire('Error', 'El nombre del comité es obligatorio y no puede estar vacío.', 'error');
      return;
    }

    if (!validNameRegex.test(nameValue)) {
      Swal.fire('Error', 'El nombre contiene caracteres especiales no permitidos.', 'error');
      return;
    }

    const data = {
      committeeName: nameValue,
      parentId: parentValue === 'null' ? null : parentValue
    };

    this.committeeService.createCommittee(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registrado',
          text: 'Comité registrado con éxito',
          timer: 2000,
          showConfirmButton: false
        });
        this.list();
        event.target.reset();
        this.resetForm();
      },
      error: () => Swal.fire('Error', 'No se pudo registrar el comité', 'error')
    });
  }

  editCommittee(item: any) {
    this.committeeForm = {
      committeeId: item.committeeId,
      committeeName: item.committeeName,
      parentId: item.parentId
    };
  }

  updateCommittee() {
    const nameValue = (this.committeeForm.committeeName || '').trim();
    const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\(\)]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\(\)]+)*$/;

    if (!nameValue) {
      Swal.fire('Error', 'El nombre no puede quedar vacío.', 'error');
      return;
    }

    if (!validNameRegex.test(nameValue)) {
      Swal.fire('Error', 'El nombre contiene caracteres especiales no permitidos.', 'error');
      return;
    }

    const dataToSend = {
      committeeName: nameValue,
      parentId: this.committeeForm.parentId
    };

    this.committeeService.updateCommittee(this.committeeForm.committeeId, dataToSend).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Actualizado con éxito',
          timer: 2000,
          showConfirmButton: false
        });

        const modalElement = document.getElementById('modalUpdate');
        if (modalElement) {
          const bootstrap = (window as any).bootstrap;
          if (bootstrap) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
          }
        }

        this.list();
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'Error al actualizar', 'error')
    });
  }

  deleteCommittee(id: string) {
    Swal.fire({
      title: '¿Desea borrar este registro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.committeeService.deleteCommitte(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro ha sido borrado', 'success');
            this.list();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  resetForm() {
    this.committeeForm = {
      committeeId: '',
      committeeName: '',
      parentId: null
    };
  }
}