import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { State } from '../../services/state';
import { Country } from '../../services/country';
import { Auth } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-state-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './state-list.html',
  styleUrls: ['./state-list.css']
})
export class StateList implements OnInit {
  states: any[] = [];
  filteredStates: any[] = [];
  countries: any[] = [];
  currentState: any = { stateName: '', initials: '', countryId: '' };
  isEditing = false;
  showModal = false;
  public authService = inject(Auth);
  pagedStates: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pagesArray: number[] = [];
  searchTerm: string = '';
  filterCountryName: string = '';
  filterStatus: string = '';
  isLoading = true;

  constructor(
    private stateService: State,
    private countryService: Country,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStates();
    this.loadCountries();
  }

  loadStates(): void {
    this.isLoading = true;
    this.stateService.getStates().subscribe({
      next: (res: any) => {
        this.states = res.results || res;
        this.filteredStates = [...this.states];
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los estados', 'error');
        this.isLoading = false;
      }
    });
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe({
      next: (res: any) => {
        this.countries = res.results || res;
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los países', 'error')
    });
  }

  filterStates(): void {
  this.filteredStates = this.states.filter(state => {
    const matchSearch = this.searchTerm === '' || state.stateName.toLowerCase().includes(this.searchTerm.toLowerCase());
    const matchCountry = this.filterCountryName === '' || state.countryName === this.filterCountryName;
    const matchStatus = this.filterStatus === '' || 
      (this.filterStatus === 'disponible' && !state.blocked) ||
      (this.filterStatus === 'enuso' && state.blocked);
    return matchSearch && matchCountry && matchStatus;
  });
  this.currentPage = 1;
  this.updatePagination();
}

  clearFilters(): void {
    this.searchTerm = '';
    this.filterCountryName = '';
    this.filterStatus = '';
    this.filteredStates = [...this.states];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredStates.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedStates = this.filteredStates.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  saveState(): void {
    const stateName = this.currentState.stateName?.trim().toUpperCase();
    const initials = this.currentState.initials?.trim().toUpperCase();
    
    if (!stateName || !initials || !this.currentState.countryId) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
    }

    if (this.isEditing && this.currentState.stateId) {
        const updateData = { 
            stateName: stateName, 
            initials: initials, 
            countryId: this.currentState.countryId 
        };
        
        this.stateService.updateState(this.currentState.stateId, updateData).subscribe({
            next: () => {
                Swal.fire('Éxito', 'Estado actualizado', 'success');
                this.loadStates();
                this.closeModal();
            },
            error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
    } else {
        this.stateService.createState({ 
            stateName: stateName, 
            initials: initials, 
            countryId: this.currentState.countryId 
        }).subscribe({
            next: () => {
                Swal.fire('Éxito', 'Estado creado', 'success');
                this.loadStates();
                this.currentState = { stateName: '', initials: '', countryId: '' };
                this.cdr.detectChanges();
            },
            error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
    }
  }

  openEditModal(state: any): void {
    this.currentState = { ...state };
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentState = { stateName: '', initials: '', countryId: '' };
    this.isEditing = false;
  }

  deleteState(state: any): void {
    if (state.blocked) {
      Swal.fire('No se puede eliminar', 'Este estado tiene ciudades asociadas', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Eliminar estado?',
      text: `¿Eliminar "${state.stateName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed && state.stateId) {
        this.stateService.deleteState(state.stateId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Estado eliminado', 'success');
            this.loadStates();
          },
          error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
      }
    });
  }
}