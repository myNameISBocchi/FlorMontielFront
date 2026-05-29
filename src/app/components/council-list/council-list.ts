import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  filteredCouncils: any[] = [];
  searchTerm: string = '';
  councilSelect: any = null;
  cities: any[] = [];
  comunities: any[] = [];
  pagedCouncils: any[] = [];
  currentPage: number = 1;
  perPage: number = 10;
  totalPages: number = 1;
  public authService = inject(Auth);
  isLoading = true;

  constructor(private council: Council, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCouncils();
    this.loadData();
  }

  getCouncils() {
    this.isLoading = true;
    this.council.findAll().subscribe({
      next: (res: any) => {
        this.councils = res.results || res.result || res;
        this.filteredCouncils = [...this.councils];
        this.currentPage = 1;
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los consejos', 'error');
        this.isLoading = false;
      }
    });
  }

  onSearch() {
  const term = this.searchTerm.trim().toLowerCase();
  
  if (!term) {
    this.filteredCouncils = [...this.councils];
  } else {
    this.filteredCouncils = this.councils.filter(item => {
      return item.councilName?.toLowerCase().includes(term) ||
             item.comunityName?.toLowerCase().includes(term) ||
             item.cityName?.toLowerCase().includes(term);
    });
  }
  
  this.currentPage = 1;
  this.updatePagination();
  this.cdr.detectChanges();
}

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCouncils.length / this.perPage);
    const startIndex = (this.currentPage - 1) * this.perPage;
    const endIndex = startIndex + this.perPage;
    this.pagedCouncils = this.filteredCouncils.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
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
    
    const nameValue = (formData.get('councilName') as string || '').trim();
    const cityValue = formData.get('cityId');
    const comunityValue = formData.get('comunityId');
    const mapsValue = (formData.get('googleMaps') as string || '').trim();

    const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/;

    if (!nameValue || !cityValue || !comunityValue) {
      Swal.fire('Error', 'Los campos obligatorios no pueden estar vacíos ni contener solo espacios.', 'error');
      return;
    }

    if (!validNameRegex.test(nameValue)) {
      Swal.fire('Error', 'El nombre contiene caracteres especiales no permitidos o espacios inválidos.', 'error');
      return;
    }

    const data = {
      councilName: nameValue,
      comunityId: comunityValue,
      cityId: cityValue,
      googleMaps: mapsValue
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

    const nameValue = (this.councilSelect.councilName || '').trim();
    const cityValue = this.councilSelect.cityId;
    const comunityValue = this.councilSelect.comunityId;
    const mapsValue = (this.councilSelect.googleMaps || '').trim();

    const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/;

    if (!nameValue || !cityValue || !comunityValue) {
      Swal.fire('Error', 'Los campos obligatorios no pueden estar vacíos ni contener solo espacios.', 'error');
      return;
    }

    if (!validNameRegex.test(nameValue)) {
      Swal.fire('Error', 'El nombre contiene caracteres especiales o formato inválido.', 'error');
      return;
    }

    const dataToSend = {
      councilName: nameValue,
      cityId: cityValue,
      comunityId: comunityValue,
      googleMaps: mapsValue
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

          const modalElement = document.getElementById('editModal');
          if (modalElement) {
            const bootstrap = (window as any).bootstrap;
            if (bootstrap) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
              modalInstance.hide();
            }
          }

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