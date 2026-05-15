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
  comunitySelect: any = null;
  pagedComunity:any[] = [];
  currentPage:number = 1;
  perPage:number = 8;
  totalPages:number = 1;

  ngOnInit(): void {
    this.getComunity();
  }

  getComunity() {
    this.comunityService.getComunity().subscribe({
      next: (data: any) => {
        this.comunity = data.result;
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer datos:', err);
      }
    });
  }

  updatePagination(){
    this.totalPages = Math.ceil(this.comunity.length / this.perPage);
    const startIndex = (this.currentPage - 1) * this.perPage;
    const endIndex = startIndex + this.perPage;

    this.pagedComunity = this.comunity.slice(startIndex,endIndex);
  }

  goToPage(page:number){
    if(page >= 1 && page <= this.totalPages){
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
          error: (err) => {
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
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Imagen actualizada',
            timer: 1500,
            showConfirmButton: false
          });
          this.getComunity();
        },
        error: (err) => Swal.fire('Error', 'No se pudo subir la imagen', 'error')
      });
    }
  }

  createComunity(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const DataComunity: any = {
      comunityName: form['comunityName'].value,
      googleMaps: form['googleMaps'].value
    }

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
      error: (err) => {
        Swal.fire('Error', 'Fallo al crear la comunidad', 'error');
      }
    });
  }

  openModalButton(item: any) {
    this.comunitySelect = { ...item };
  }

  updateComunity(event: Event) {
    event.preventDefault();

    const id = this.comunitySelect.comunityId;
    const data = {
      comunityName: this.comunitySelect.comunityName,
      googleMaps: this.comunitySelect.googleMaps
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
        this.getComunity();
      },
      error: (error) => {
        Swal.fire('Error', 'Fallo al actualizar', 'error');
      }
    });
  }
}