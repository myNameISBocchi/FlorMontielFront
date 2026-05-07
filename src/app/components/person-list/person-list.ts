import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Person } from '../../services/person';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-list',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-list.html',
  styleUrl: './person-list.css',
})
export class PersonList implements OnInit {
  private router = inject(Router);
  private personService = inject(Person);
  private cdr = inject(ChangeDetectorRef);

  peoples: any[] = [];
  filteredPeoples:any[] = [];
  searchTerm: string = '';
  personSelect:any = null;
  comunity:any[] = [];
  council:any[] = [];
  committee:any[] = [];
  city:any[] = [];


  ngOnInit(): void {
    this.loadPeoples();
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.personService.getComunity().subscribe(res => this.comunity = res.result || res.results || res);
    this.personService.getCouncil().subscribe(res => this.council = res.result || res.results || res);
    this.personService.getCommitte().subscribe(res => this.committee = res.result || res.results || res);
    this.personService.getCity().subscribe(res => this.city = res.results || res.result || res);
  }

  loadPeoples(){
    this.personService.getPeoples().subscribe({
    next:(data:any) => {
      this.peoples = data.results;
      this.filteredPeoples = data.results || [];
      this.cdr.detectChanges();
      
    },
    error: (err) => console.error('Error:',err)
  });
  }
  goToRegister() {
    this.router.navigate(['/personForm']); 
  }

  openEditModal(person: any) {
  this.personSelect = { ...person };
  if (this.personSelect.date) {
    this.personSelect.date = this.personSelect.date.split(' ')[0];
  }
}

  onSearch(){
    const data = this.searchTerm.trim();
    if(!data){
      this.filteredPeoples = this.peoples;
      return;
    }

    this.personService.searchPeople(data).subscribe({
      next: (res:any) => {
        this.filteredPeoples = res.results || [];
        this.cdr.detectChanges();
      },
      error:(err) => {
        console.error('error',err);
        this.filteredPeoples = [];
      }
    });

      }

  deletePerson(id:string){
    if(confirm("deseas eliminar este registro?")){
      this.personService.deletePerson(id).subscribe({
        next:() => {
          alert("eliminado con exito!");
          this.loadPeoples();
        },
        error: (err) => console.error("error:", err)

      })
    }
  }

  onFileSelected(event:any, id:string){

    const file: File = event.target.files[0];
    if(file){
      const formData = new FormData();
      formData.append('photoPerson', file);

      this.personService.uploadPhoto(id,formData).subscribe({
        next: (res) => {
          alert("Imagen actualizado con exito");
          this.loadPeoples();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("error",err)

        }
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
        alert("¡Registro actualizado con éxito!");
        this.loadPeoples();
        this.personSelect = null;
        const modalElement = document.getElementById('editPersonModal');
        if (modalElement) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (bootstrapModal) bootstrapModal.hide();
        }
      },
      error: (err) => {
        console.error("Error:", err);
        alert("No se pudo actualizar el registro.");
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-avatar.png';
}
  
}
