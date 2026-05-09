import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Committee } from '../../services/committee';

@Component({
  selector: 'app-committee-list',
  imports: [CommonModule,FormsModule],
  templateUrl: './committee-list.html',
  styleUrl: './committee-list.css',
})
export class CommitteeList {
  private committeeService = inject(Committee);
  private cdr = inject(ChangeDetectorRef);

  committees:any[] = [];

  committeeForm = {
    committeeId: '',
  committeeName:'',
  parentId:null
  };

 ngOnInit():void{
  this.list();
 }

 list(){
  this.committeeService.getCommittee().subscribe({
    next: (res) => {
      this.committees = res.result;
      this.cdr.detectChanges();
    },
    error:(err) => console.error('error al cargar comites', err) 
  });
 }

 createCommittee(){
  this.committeeService.createCommittee(this.committeeForm).subscribe({
    next: () => {
      alert('Comité registrado con éxito');
      this.list();
      this.resetForm();
    }
  });
 }

 editCommittee(item:any){
  this.committeeForm = {
    committeeId: item.committeeId,
    committeeName: item.committeeName,
    parentId: item.parentId
  };
 }

 updateCommittee() {
    const { committeeId, ...data } = this.committeeForm;

    this.committeeService.updateCommittee(committeeId, data).subscribe({
      next: () => {
        alert('Actualizado con éxito');
        this.list();
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => alert('Error al actualizar')
    });
  }

 deleteCommittee(id:string){
  if(confirm('¿desea borrar este registro')){
    this.committeeService.deleteCommitte(id).subscribe(() => this.list());
  }
 }

 resetForm() {
    this.committeeForm = {
      committeeId: '',
      committeeName: '',
      parentId: null
    };
  }
}
