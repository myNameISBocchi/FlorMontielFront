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

  ngOnInit(): void {
    this.loadPeoples();
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
    this.router.navigate(['/personForm']); //
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
  handleImageError(event: any) {
    event.target.src = 'assets/img/default-avatar.png';
}
  
}
