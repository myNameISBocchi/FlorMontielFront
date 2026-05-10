import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Committee } from '../../services/committee';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-committee-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './committee-list.html',
  styleUrl: './committee-list.css',
})
export class CommitteeList implements OnInit {
  private committeeService = inject(Committee);
  private cdr = inject(ChangeDetectorRef);

  committees: any[] = [];

  committeeForm = {
    committeeId: '',
    committeeName: '',
    parentId: null
  };

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.committeeService.getCommittee().subscribe({
      next: (res) => {
        this.committees = res.result;
        this.cdr.detectChanges();
      },
      error: (err) => {
        Swal.fire('Error', 'Error al cargar comités', 'error');
      }
    });
  }

  createCommittee() {
    this.committeeService.createCommittee(this.committeeForm).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registrado',
          text: 'Comité registrado con éxito',
          timer: 2000,
          showConfirmButton: false
        });
        this.list();
        this.resetForm();
      },
      error: () => Swal.fire('Error', 'No se pudo registrar el comité', 'error')
    });
  }

  editCommittee(item: any) {
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
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Actualizado con éxito',
          timer: 2000,
          showConfirmButton: false
        });
        this.list();
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => Swal.fire('Error', 'Error al actualizar', 'error')
    });
  }

  deleteCommittee(id: string) {
    Swal.fire({
      title: '¿Desea borrar este registro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.committeeService.deleteCommitte(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro ha sido borrado', 'success');
            this.list();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  resetForm() {
    this.committeeForm = {
      committeeId: '',
      committeeName: '',
      parentId: null
    };
  }
}