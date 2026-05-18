import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Country } from '../../services/country';
import { Auth } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './country-list.html',
  styleUrls: ['./country-list.css']
})
export class CountryList implements OnInit {
  countries: any[] = [];
  filteredCountries: any[] = [];
  currentCountry: any = { countryName: '' };
  isEditing = false;
  showModal = false;
  public authService = inject(Auth);
  pagedCountries: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pagesArray: number[] = [];

  constructor(
    private countryService: Country,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe({
      next: (res: any) => {
        this.countries = res.results || res;
        this.filteredCountries = [...this.countries];
        this.updatePagination();
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los países', 'error')
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCountries.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedCountries = this.filteredCountries.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  saveCountry(): void {
    const countryName = this.currentCountry.countryName?.trim().toUpperCase();
    if (!countryName) {
      Swal.fire('Error', 'El nombre del país es obligatorio', 'error');
      return;
    }

    this.currentCountry.countryName = countryName;

    if (this.isEditing && this.currentCountry.countryId) {
      this.countryService.updateCountry(this.currentCountry.countryId, this.currentCountry).subscribe({
        next: () => {
          Swal.fire('Éxito', 'País actualizado', 'success');
          this.loadCountries();
          this.closeModal();
        },
        error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
      });
    } else {
      this.countryService.createCountry(this.currentCountry).subscribe({
        next: () => {
          Swal.fire('Éxito', 'País creado', 'success');
          this.loadCountries();
          this.currentCountry = { countryName: '' };
          this.cdr.detectChanges();
        },
        error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
      });
    }
  }

  openEditModal(country: any): void {
    this.currentCountry = { ...country };
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCountry = { countryName: '' };
    this.isEditing = false;
  }

  deleteCountry(country: any): void {
    if (country.blocked) {
      Swal.fire('No se puede eliminar', 'Este país tiene estados asociados', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Eliminar país?',
      text: `¿Eliminar "${country.countryName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed && country.countryId) {
        this.countryService.deleteCountry(country.countryId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'País eliminado', 'success');
            this.loadCountries();
          },
          error: (err) => Swal.fire('Error', err.error?.msg || 'Error', 'error')
        });
      }
    });
  }
}