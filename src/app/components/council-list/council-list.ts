import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Council } from '../../services/council';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-council-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './council-list.html',
  styleUrl: './council-list.css',
})
export class CouncilList implements OnInit {
  councils: any[] = [];
  councilSelect: any = null;
  cities: any[] = [];
  comunities: any[] = [];
  pagedCouncils:any[] = [];
  currentPage:number = 1;
  perPage:number = 10;
  totalPages:number = 1;
  public authService = inject(Auth);

  constructor(private council: Council, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCouncils();
    this.loadData();
  }

  getCouncils() {
    this.council.findAll().subscribe({
      next: (res: any) => {
        this.councils = res.results || res.result || res;
        this.currentPage = 1;
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los consejos', 'error');
      }
    });
  }

  updatePagination(){
    this.totalPages = Math.ceil(this.councils.length / this.perPage);
    const startIndex = (this.currentPage -1) * this.perPage;
    const endIndex = startIndex + this.perPage;
    this.pagedCouncils = this.councils.slice(startIndex,endIndex);
  }

  goToPage(page:number){
    if(page >= 1 && page<= this.totalPages){
      this.currentPage = page;
      this.updatePagination();

    }

  }

  loadData() {
    this.council.getCities().subscribe(res => this.cities = res.results);
    this.council.getComunity().subscribe(res => this.comunities = res.result);
  }

  createCouncil(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      councilName: formData.get('councilName'),
      comunityId: formData.get('comunityId'),
      cityId: formData.get('cityId'),
      googleMaps: formData.get('googleMaps')
    };

    this.council.create(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'Consejo creado con éxito',
          timer: 2000,
          showConfirmButton: false
        });
        this.getCouncils();
        event.target.reset();
      },
      error: () => Swal.fire('Error', 'No se pudo crear el registro', 'error')
    });
  }

  openEditModal(item: any) {
    this.councilSelect = { ...item };
  }

  updateCouncil() {
    if (!this.councilSelect.councilId) {
      Swal.fire('Error', 'No se encontró el ID del consejo', 'error');
      return;
    }

    const dataToSend = {
      councilName: this.councilSelect.councilName,
      cityId: this.councilSelect.cityId,
      comunityId: this.councilSelect.comunityId,
      googleMaps: this.councilSelect.googleMaps
    };

    this.council.update(this.councilSelect.councilId, dataToSend).subscribe({
      next: (res) => {
        if (res.error === 1) {
          Swal.fire('Atención', res.msg, 'warning');
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: '¡Registro actualizado con éxito!',
            timer: 2000,
            showConfirmButton: false
          });
          this.getCouncils();
          this.councilSelect = null;
        }
      },
      error: () => {
        Swal.fire('Error', 'Error crítico del servidor', 'error');
      }
    });
  }

  deleteCouncil(id: string) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
      cancelButtonText: "Cancelar"
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.council.delete(id).subscribe({
          next: () => {
            Swal.fire({
              title: "¡Eliminado!",
              text: "El consejo comunal ha sido borrado.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
            this.getCouncils();
            this.cdr.detectChanges();
          },
          error: () => {
            Swal.fire("Error", "No se pudo eliminar el registro.", "error");
          }
        });
      }
    });
  }
}