import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Person } from '../../services/person';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-list.html',
  styleUrl: './person-list.css',
})
export class PersonList implements OnInit {
  private router = inject(Router);
  private personService = inject(Person);
  private cdr = inject(ChangeDetectorRef);

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

  ngOnInit(): void {
    this.loadPeoples();
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.personService.getRoles().subscribe(res => this.roles = res.results || res);
    this.personService.getComunity().subscribe(res => this.comunity = res.result || res.results || res);
    this.personService.getCouncil().subscribe(res => this.council = res.result || res.results || res);
    this.personService.getCommitte().subscribe(res => this.committee = res.result || res.results || res);
    this.personService.getCity().subscribe(res => this.city = res.results || res.result || res);
  }

  loadPeoples() {
    this.personService.getPeoples().subscribe({
      next: (data: any) => {
        this.peoples = data.results;
        this.filteredPeoples = data.results || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/personForm']);
  }

  openEditModal(person: any) {
    this.personSelect = { ...person };
    this.selectedRolesMap = {};

    if (this.personSelect.date) {
      this.personSelect.date = this.personSelect.date.split(' ')[0];
    }

    if (person.roleId) {
      const currentRoles = Array.isArray(person.roleId) ? person.roleId : [person.roleId];
      currentRoles.forEach((id: string) => {
        this.selectedRolesMap[id] = true;
      });
    }
  }

  onSearch() {
    const data = this.searchTerm.trim();
    if (!data) {
      this.filteredPeoples = this.peoples;
      return;
    }

    this.personService.searchPeople(data).subscribe({
      next: (res: any) => {
        this.filteredPeoples = res.results || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('error', err);
        this.filteredPeoples = [];
      }
    });
  }

  isRoleSelected(roleId: string): boolean {
    return !!this.selectedRolesMap[roleId];
  }

  toggleRole(roleId: string): void {
    this.selectedRolesMap[roleId] = !this.selectedRolesMap[roleId];
  }

  saveRoles() {
    if (!this.personSelect || !this.personSelect.personId) return;

    const rolesToSave = Object.keys(this.selectedRolesMap)
      .filter(key => this.selectedRolesMap[key] === true);

    this.personService.assignRoles(this.personSelect.personId, rolesToSave).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Roles actualizados',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadPeoples();
        const modalElement = document.getElementById('assignRolesModal');
        if (modalElement) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (bootstrapModal) bootstrapModal.hide();
        }
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron asignar los roles', 'error');
      }
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
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Registro eliminado con éxito',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadPeoples();
          },
          error: (err) => Swal.fire('Error', 'No se pudo eliminar el registro', 'error')
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
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Imagen actualizada',
            timer: 1500,
            showConfirmButton: false
          });
          this.loadPeoples();
          this.cdr.detectChanges();
        },
        error: (err) => Swal.fire('Error', 'Error al subir la imagen', 'error')
      });
    }
  }

  updatePerson() {
    if (!this.personSelect || !this.personSelect.personId) return;
    const id = this.personSelect.personId;
    const dataToUpdate: any = {
      firstName: this.personSelect.firstName,
      lastName: this.personSelect.lastName,
      identification: this.personSelect.identification,
      phone: this.personSelect.phone,
      date: this.personSelect.date,
      cityId: this.personSelect.cityId,
      email: this.personSelect.email,
      status: this.personSelect.status
    };

    if (this.personSelect.password && this.personSelect.password.trim() !== '') {
      dataToUpdate.password = this.personSelect.password;
    }

    this.personService.updatePerson(id, dataToUpdate).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Registro actualizado con éxito',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadPeoples();
        this.personSelect = null;
        const modalElement = document.getElementById('editPersonModal');
        if (modalElement) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (bootstrapModal) bootstrapModal.hide();
        }
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo actualizar el registro', 'error');
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-avatar.png';
  }
}