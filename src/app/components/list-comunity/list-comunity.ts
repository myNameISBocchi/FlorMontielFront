import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Comunity } from '../../services/comunity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-list-comunity',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './list-comunity.html',
  styleUrl: './list-comunity.css',
})
export class ListComunity implements OnInit {
  
  private comunityService = inject(Comunity);
  private cdr = inject(ChangeDetectorRef);

  comunity:any[] = [];

  ngOnInit(): void {
    this.getComunity();
  }

  getComunity(){
    this.comunityService.getComunity().subscribe({
      next: (data:any) =>{
        this.comunity  = data.result;
        this.cdr.detectChanges();
        console.log('lo que llega de laravel', data);
      },
      error :(err) => {
        console.error('Error al traer datos:', err);
      }
    });
  }

  deleteComunity(id:number){
    if(confirm("Desea eliminar el registro?")){
      this.comunityService.deleteComunity(id).subscribe({
        next: () => {
          this.comunity.filter(c => c.id !== id);
          alert("eliminado con exito");
          this.getComunity();
        },
        error: (err) => {
          console.log("error al borrar: ", err);
        }
      })
    }
  }

  onFileSelected(event: any, id: number){
    const file: File = event.target.files[0];
    if(file){
      const formData = new FormData();
      formData.append('photoComunity', file);

      this.comunityService.updatePhoto(id, formData).subscribe({
      next:(res) => {
        alert('imagen update');
        this.getComunity();
      },
      error: (err) => alert('error al subir imagen')
    });
    }
  }

  createComunity(event:Event){
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const DataComunity:any = {
      comunityName:form['comunityName'].value,
      googleMaps:form['googleMaps'].value
    }
    this.comunityService.createComunity(DataComunity).subscribe({
      next:() => {
        alert('comunidad creada con exito');
        form.reset();
        this.getComunity();
        this.comunitySelect = null;
      },
      error: (err) => {
        console.log("fallo al crear", err);
      }
    });

  }
  comunitySelect:any = null;
  openModalButton(item:any){
    this.comunitySelect = {...item};
  }

  updateComunity(event:Event){
    event.preventDefault();

    const id = this.comunitySelect.comunityId;
    const data= {
      comunityName : this.comunitySelect.comunityName,
      googleMaps :this.comunitySelect.googleMaps
    };

    this.comunityService.updateComunity(id,data).subscribe({
      next: () => {
        alert("comunidad actualizada");
        this.getComunity();
      },
      error: (error) =>  {
        console.log("fallo en actualizar", error);

      }
    });
  }

}
