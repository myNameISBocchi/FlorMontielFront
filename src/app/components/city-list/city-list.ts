import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { City } from '../../services/city';
import { State } from '../../services/state';
import { Auth } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.css']
})
export class CityList implements OnInit {
  cities: any[] = [];
  filteredCities: any[] = [];
  states: any[] = [];
  currentCity: any = { cityName: '', stateId: '' };
  isEditing = false;
  showModal = false;
  public authService = inject(Auth);
  pagedCities: any[] = [];
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 1;
  pagesArray: number[] = [];

  constructor(
    private cityService: City,
    private stateService: State,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadStates();
  }

  loadCities(): void {
    this.cityService.getCities().subscribe({
      next: (res: any) => {
        this.cities = res.results || res;
        this.filteredCities = [...this.cities];
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar las ciudades', 'error')
    });
  }

  loadStates(): void {
    this.stateService.getStates().subscribe({
      next: (res: any) => {
        this.states = res.results || res;
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los estados', 'error')
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCities.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedCities = this.filteredCities.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  saveCity(): void {
    const cityName = this.currentCity.cityName?.trim().toUpperCase();
    
    if (!cityName || !this.currentCity.stateId) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
    }

    if (this.isEditing && this.currentCity.cityId) {
        const updateData = { 
            cityName: cityName, 
            stateId: this.currentCity.stateId 
        };
        
        this.cityService.updateCity(this.currentCity.cityId, updateData).subscribe({
            next: () => {
                Swal.fire('Éxito', 'Ciudad actualizada', 'success');
                this.loadCities();
                this.closeModal();
            },
            error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
    } else {
        this.cityService.createCity({ 
            cityName: cityName, 
            stateId: this.currentCity.stateId 
        }).subscribe({
            next: () => {
                Swal.fire('Éxito', 'Ciudad creada', 'success');
                this.loadCities();
                this.currentCity = { cityName: '', stateId: '' };
                this.cdr.detectChanges();
            },
            error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
    }
}

  openEditModal(city: any): void {
    this.currentCity = { ...city };
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCity = { cityName: '', stateId: '' };
    this.isEditing = false;
  }

  deleteCity(city: any): void {
    Swal.fire({
      title: '¿Eliminar ciudad?',
      text: `¿Eliminar "${city.cityName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed && city.cityId) {
        this.cityService.deleteCity(city.cityId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Ciudad eliminada', 'success');
            this.loadCities();
          },
          error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
      }
    });
  }
}