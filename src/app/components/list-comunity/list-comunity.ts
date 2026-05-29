import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Comunity } from '../../services/comunity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-comunity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-comunity.html',
  styleUrl: './list-comunity.css',
})
export class ListComunity implements OnInit {

  private comunityService = inject(Comunity);
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(Auth);

  comunity: any[] = [];
  filteredComunity: any[] = [];
  searchTerm: string = '';
  comunitySelect: any = null;
  pagedComunity: any[] = [];
  currentPage: number = 1;
  perPage: number = 8;
  totalPages: number = 1;
  isLoading = true;

  ngOnInit(): void {
    this.getComunity();
  }

  getComunity() {
    this.isLoading = true;
    this.comunityService.getComunity().subscribe({
      next: (data: any) => {
        this.comunity = data.result;
        this.filteredComunity = [...this.comunity];
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer datos:', err);
        this.isLoading = false;
      }
    });
  }

 onSearch() {
  const term = this.searchTerm.trim().toLowerCase();
  
  if (!term) {
    this.filteredComunity = [...this.comunity];
  } else {
    this.filteredComunity = this.comunity.filter(item => {
      return item.comunityName?.toLowerCase().includes(term) ||
             item.googleMaps?.toLowerCase().includes(term);
    });
  }
  
  this.currentPage = 1;
  this.updatePagination();
  this.cdr.detectChanges();
}

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredComunity.length / this.perPage);
    const startIndex = (this.currentPage - 1) * this.perPage;
    const endIndex = startIndex + this.perPage;
    this.pagedComunity = this.filteredComunity.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  deleteComunity(id: number) {
    Swal.fire({
      title: "¿Desea eliminar el registro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.comunityService.deleteComunity(id).subscribe({
          next: () => {
            Swal.fire({
              title: "Eliminado",
              text: "Registro eliminado con éxito",
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
            this.getComunity();
          },
          error: () => {
            Swal.fire("Error", "No se pudo borrar el registro", "error");
          }
        });
      }
    });
  }

  onFileSelected(event: any, id: number) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photoComunity', file);

      this.comunityService.updatePhoto(id, formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Imagen actualizada',
            timer: 1500,
            showConfirmButton: false
          });
          this.getComunity();
        },
        error: () => Swal.fire('Error', 'No se pudo subir la imagen', 'error')
      });
    }
  }

  createComunity(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const nameValue = form['comunityName'].value.trim();
    const mapsValue = form['googleMaps'].value.trim();

    const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/;
    const validMapsRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.,\-\/\s:]+$/;

    if (!nameValue) {
      Swal.fire('Error', 'El nombre de la comunidad es obligatorio.', 'error');
      return;
    }

    if (!validNameRegex.test(nameValue)) {
      Swal.fire('Error', 'El nombre contiene caracteres especiales no permitidos.', 'error');
      return;
    }

    if (mapsValue && !validMapsRegex.test(mapsValue)) {
      Swal.fire('Error', 'La ubicación contiene un formato o caracteres inválidos.', 'error');
      return;
    }

    const DataComunity: any = {
      comunityName: nameValue,
      googleMaps: mapsValue
    };

    this.comunityService.createComunity(DataComunity).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Comunidad creada con éxito',
          timer: 2000,
          showConfirmButton: false
        });
        form.reset();
        this.getComunity();
        this.comunitySelect = null;
      },
      error: () => {
        Swal.fire('Error', 'Fallo al crear la comunidad', 'error');
      }
    });
  }

  openModalButton(item: any) {
    this.comunitySelect = { ...item };
    if (!this.comunitySelect.googleMaps) {
      this.comunitySelect.googleMaps = '';
    }
  }

  updateComunity(event: Event) {
    event.preventDefault();

    const id = this.comunitySelect.comunityId;
    const nameValue = this.comunitySelect.comunityName.trim();
    const mapsValue = this.comunitySelect.googleMaps ? this.comunitySelect.googleMaps.trim() : '';

    const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/;
    const validMapsRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.,\-\/\s:?=&%_+!*(),;@]+$/;

    if (!nameValue) {
      Swal.fire('Error', 'El nombre de la comunidad es obligatorio.', 'error');
      return;
    }

    if (!validNameRegex.test(nameValue)) {
      Swal.fire('Error', 'El nombre contiene caracteres especiales o formato inválido.', 'error');
      return;
    }

    if (mapsValue && !validMapsRegex.test(mapsValue)) {
      Swal.fire('Error', 'La ubicación contiene caracteres especiales no permitidos.', 'error');
      return;
    }

    const data = {
      comunityName: nameValue,
      googleMaps: mapsValue
    };

    this.comunityService.updateComunity(id, data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Comunidad actualizada con éxito',
          timer: 2000,
          showConfirmButton: false
        });

        const modalElement = document.getElementById('editModal');
        if (modalElement) {
          const bootstrap = (window as any).bootstrap;
          if (bootstrap) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
          }
        }

        this.getComunity();
      },
      error: () => {
        Swal.fire('Error', 'Fallo al actualizar', 'error');
      }
    });
  }
}