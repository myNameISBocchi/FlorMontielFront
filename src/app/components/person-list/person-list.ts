import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Person } from '../../services/person';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ReportService } from '../../services/report';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './person-list.html',
  styleUrl: './person-list.css',
})
export class PersonList implements OnInit {
  private router = inject(Router);
  private personService = inject(Person);
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(Auth);
  private reportService = inject(ReportService);
  private fb = inject(FormBuilder);

  peoples: any[] = [];
  filteredPeoples: any[] = [];
  searchTerm: string = '';
  personSelect: any = null;
  comunity: any[] = [];
  council: any[] = [];
  committee: any[] = [];
  city: any[] = [];
  roles: any[] = [];
  selectedRolesMap: { [key: string]: boolean } = {};
  selectedCouncilId: string | null = null;
  pagedPeoples: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pagesArray: number[] = [];
  ocultarPassword: boolean = true;
  editForm!: FormGroup;
  filteredCouncils: any[] = [];
  filteredCommittees: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadPeoples();
    this.initEditForm();
    this.cargarCatalogos();
    this.loadAllCommittees();
  }

  initEditForm() {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/)]],
      identification: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.validarTelefonoVenezuela]],
      date: ['', [Validators.required, this.validarMayorDeEdad]],
      cityId: ['', [Validators.required]],
      comunityId: [''],
      councilId: [''],
      committeeId: [''],
      password: ['', [Validators.minLength(8)]]
    });
  }

  loadAllCommittees() {
    this.personService.getCommitte().subscribe({
      next: (res: any) => {
        this.committee = res?.result || res?.results || res || [];
        this.filteredCommittees = this.committee;
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    
    if (!term) {
      this.filteredPeoples = [...this.peoples];
    } else {
      this.filteredPeoples = this.peoples.filter(person => {
        return person.firstName?.toLowerCase().includes(term) ||
               person.lastName?.toLowerCase().includes(term) ||
               person.identification?.toLowerCase().includes(term) ||
               person.email?.toLowerCase().includes(term) ||
               person.phone?.toLowerCase().includes(term) ||
               person.comunityName?.toLowerCase().includes(term) ||
               person.councilName?.toLowerCase().includes(term) ||
               person.committeeName?.toLowerCase().includes(term) ||
               person.roleName?.toLowerCase().includes(term);
      });
    }
    
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredPeoples.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPeoples = this.filteredPeoples.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  cargarCatalogos() {
    this.personService.getRoles().subscribe(res => this.roles = res?.results || res || []);
    this.personService.getComunity().subscribe(res => this.comunity = res?.result || res?.results || res || []);
    this.personService.getCouncil().subscribe(res => this.council = res?.result || res?.results || res || []);
    this.personService.getCity().subscribe(res => this.city = res?.results || res?.result || res || []);
  }

  loadPeoples() {
    this.isLoading = true;
    this.personService.getPeoples().subscribe({
      next: (data: any) => {
        this.peoples = (data.results || []).map((person: any) => {
          if (person.roleName && typeof person.roleName === 'string') {
            person.roleList = person.roleName.split(', ');
          } else if (Array.isArray(person.roleName)) {
            person.roleList = person.roleName;
          } else {
            person.roleList = [];
          }
          return person;
        });
        this.filteredPeoples = [...this.peoples];
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/personForm']);
  }

  openEditModal(person: any) {
    this.personSelect = { ...person };
    this.selectedRolesMap = {};
    
    if (this.roles.length === 0) {
      this.personService.getRoles().subscribe((res: any) => {
        this.roles = res?.results || res || [];
        this.marcarRolesDelUsuario();
      });
    } else {
      this.marcarRolesDelUsuario();
    }

    let fechaFormateada = '';
    if (this.personSelect.date) {
      fechaFormateada = this.personSelect.date.split(' ')[0];
    }

    this.editForm.patchValue({
      firstName: this.personSelect.firstName,
      lastName: this.personSelect.lastName,
      identification: this.personSelect.identification,
      email: this.personSelect.email,
      phone: this.personSelect.phone,
      date: fechaFormateada,
      cityId: this.personSelect.cityId,
      comunityId: this.personSelect.comunityId || null,
      councilId: this.personSelect.councilId || null,
      committeeId: this.personSelect.committeeId || null,
      password: ''
    });

    if (this.personSelect.comunityId) {
      this.personService.getCouncilsByComunity(this.personSelect.comunityId).subscribe({
        next: (res: any) => {
          this.filteredCouncils = res.results || res || [];
        }
      });
    }

    if (this.filteredCommittees.length === 0) {
      this.loadAllCommittees();
    }
  }

  marcarRolesDelUsuario() {
    if (!this.personSelect) return;
    
    if (this.personSelect.roleId) {
      let userRoleIds: string[] = [];
      
      if (typeof this.personSelect.roleId === 'string') {
        userRoleIds = this.personSelect.roleId.split(',').map((id: string) => id.trim());
      } else if (Array.isArray(this.personSelect.roleId)) {
        userRoleIds = this.personSelect.roleId;
      }
      
      userRoleIds.forEach((roleId: string) => {
        if (roleId) {
          this.selectedRolesMap[roleId] = true;
        }
      });
    }
    
    if (this.personSelect.roleList && this.personSelect.roleList.length > 0 && this.roles.length > 0) {
      this.roles.forEach((role: any) => {
        if (this.personSelect.roleList.includes(role.roleName)) {
          this.selectedRolesMap[role.roleId] = true;
        }
      });
    }
    
    if (this.personSelect.roleName && typeof this.personSelect.roleName === 'string' && this.roles.length > 0) {
      const roleNames = this.personSelect.roleName.split(', ');
      this.roles.forEach((role: any) => {
        if (roleNames.includes(role.roleName)) {
          this.selectedRolesMap[role.roleId] = true;
        }
      });
    }
    
    this.cdr.detectChanges();
  }

  onComunityChange(event: any) {
    const comunityId = event.target.value;
    if (comunityId) {
      this.personService.getCouncilsByComunity(comunityId).subscribe({
        next: (res: any) => {
          this.filteredCouncils = res.results || res || [];
          this.editForm.patchValue({ councilId: null });
        }
      });
    } else {
      this.filteredCouncils = [];
      this.editForm.patchValue({ councilId: null });
    }
  }

  onCouncilChange(event: any) {}

  isRoleSelected(roleId: string): boolean {
    return !!this.selectedRolesMap[roleId];
  }

  toggleRole(roleId: string): void {
    this.selectedRolesMap[roleId] = !this.selectedRolesMap[roleId];
  }

  saveRoles() {
    if (!this.personSelect || !this.personSelect.personId) return;

    const rolesToSave = Object.keys(this.selectedRolesMap).filter(key => this.selectedRolesMap[key] === true);

    this.personService.assignRoles(this.personSelect.personId, rolesToSave).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Roles actualizados', timer: 2000, showConfirmButton: false });
        this.loadPeoples();
        const modalElement = document.getElementById('assignRolesModal');
        if (modalElement) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (bootstrapModal) bootstrapModal.hide();
        }
      },
      error: () => Swal.fire('Error', 'No se pudieron asignar los roles', 'error')
    });
  }

  deletePerson(id: string) {
    Swal.fire({
      title: "¿Deseas eliminar este registro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.personService.deletePerson(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Registro eliminado con éxito', timer: 2000, showConfirmButton: false });
            this.loadPeoples();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el registro', 'error')
        });
      }
    });
  }

  onFileSelected(event: any, id: string) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photoPerson', file);
      this.personService.uploadPhoto(id, formData).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Imagen actualizada', timer: 1500, showConfirmButton: false });
          this.loadPeoples();
          this.cdr.detectChanges();
        },
        error: () => Swal.fire('Error', 'Error al subir la imagen', 'error')
      });
    }
  }

  updatePerson() {
    if (!this.personSelect || !this.personSelect.personId) return;

    if (this.editForm.valid) {
      const id = this.personSelect.personId;
      const formValues = this.editForm.value;

      const dataToUpdate: any = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        identification: formValues.identification,
        phone: formValues.phone,
        date: formValues.date,
        cityId: formValues.cityId,
        email: formValues.email,
        status: this.personSelect.status,
        comunityId: formValues.comunityId,
        councilId: formValues.councilId,
        committeeId: formValues.committeeId
      };

      if (formValues.password && formValues.password.trim() !== '') {
        dataToUpdate.password = formValues.password;
      }

      this.personService.updatePerson(id, dataToUpdate).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Registro actualizado con éxito', timer: 2000, showConfirmButton: false });
          this.loadPeoples();
          this.personSelect = null;
          const modalElement = document.getElementById('editPersonModal');
          if (modalElement) {
            const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
            if (bootstrapModal) bootstrapModal.hide();
          }
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar el registro', 'error')
      });
    } else {
      this.editForm.markAllAsTouched();
      Swal.fire({ icon: 'warning', title: 'Campos incompletos o incorrectos', text: 'Por favor, revisa las validaciones antes de guardar' });
    }
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-avatar.png';
  }

  generarReporteGeneral() {
    const filtros: any = {};
    if (this.selectedCouncilId) filtros.councilId = this.selectedCouncilId;
    if (this.searchTerm) filtros.firstName = this.searchTerm.trim();

    this.reportService.imprimirVoceros(filtros).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Reporte_General_Voceros_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    });
  }

  togglePassword(): void {
    this.ocultarPassword = !this.ocultarPassword;
  }

  validarTelefonoVenezuela(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor || valor === '+58 ') return { required: true };
    const regexTel = /^\+58 (412|414|416|424|426)-\d{3}-\d{4}$/;
    return regexTel.test(valor) ? null : { telefonoInvalido: true };
  }

  validarMayorDeEdad(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;
    const fechaNacimiento = new Date(valor);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  formatearCedula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.slice(0, 8);
    let valorFormateado = valor;
    if (valor.length > 0) valorFormateado = new Intl.NumberFormat('es-VE').format(parseInt(valor, 10));
    input.value = valorFormateado;
    this.editForm.get('identification')?.setValue(valorFormateado, { emitEvent: false });
    this.editForm.get('identification')?.markAsTouched();
    this.editForm.get('identification')?.updateValueAndValidity();
  }

  formatearTelefono(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;
    if (!valor.startsWith('+58 ')) valor = '+58 ' + valor.replace(/^\+58\s*/, '');
    let digitos = valor.substring(4).replace(/\D/g, '');
    if (digitos.startsWith('0')) digitos = digitos.substring(1);
    if (digitos.length > 10) digitos = digitos.slice(0, 10);
    let formateado = '+58 ';
    if (digitos.length > 0) formateado += digitos.substring(0, 3);
    if (digitos.length > 3) formateado += '-' + digitos.substring(3, 6);
    if (digitos.length > 6) formateado += '-' + digitos.substring(6, 10);
    input.value = formateado;
    this.editForm.get('phone')?.setValue(formateado, { emitEvent: false });
    this.editForm.get('phone')?.markAsTouched();
    this.editForm.get('phone')?.updateValueAndValidity();
  }
}