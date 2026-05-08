import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Person } from '../../services/person';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './person-form.html',
  styleUrl: './person-form.css',
})
export class PersonForm implements OnInit {
  private fb = inject(FormBuilder);
  private personService = inject(Person);
  private router = inject(Router);

  personForm!: FormGroup;
  comunity: any[] = [];
  council: any[] = [];
  committee: any[] = [];
  city: any[] = [];
  subcommittees: any[] = [];
  showSubcommittee: boolean = false;

  ngOnInit(): void {
    this.cargarDatos();
    this.personForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      identification: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      date: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      comunityId: [''],
      councilId: [''],
      committeeId: [''],
      subcommitteeId: [''],
      roleId: ['[]'],
      password: ['']
    });

    this.personForm.get('comunityId')?.valueChanges.subscribe(id => {
      if (id) {
        this.onComunityChange(id);
      } else {
        this.council = [];
        this.personForm.patchValue({ councilId: '' });
      }
    });

    this.personForm.get('committeeId')?.valueChanges.subscribe(id => {
      if (id) {
        this.onCommitteeChange(id);
      } else {
        this.subcommittees = [];
        this.showSubcommittee = false;
        this.personForm.patchValue({ subcommitteeId: '' });
      }
    });
  }

  onCommitteeChange(id: string) {
    const selectedComm = this.committee.find(c => c.committeeId === id);
    if (selectedComm && selectedComm.committeeName.toUpperCase() === 'EJECUTIVA') {
      this.personService.getSubcommittees(id).subscribe(res => {
        this.subcommittees = res.result || res;
        this.showSubcommittee = this.subcommittees.length > 0;
      });
    } else {
      this.showSubcommittee = false;
      this.subcommittees = [];
      this.personForm.patchValue({ subcommitteeId: '' });
    }
  }

  onComunityChange(comunityId: string) {
    this.personService.getCouncilsByComunity(comunityId).subscribe(res => {
      this.council = res.result || res.results || res;
      this.personForm.patchValue({ councilId: '' });
    });
  }

  cargarDatos() {
    this.personService.getComunity().subscribe(res => {
      this.comunity = res.result || res.results || res;
    });

    this.personService.getCommitte().subscribe(res => {
      this.committee = res.result || res.results || res;
    });

    this.personService.getCity().subscribe(res => {
      this.city = res.results || res.result || res;
    });
  }

  onSubmit() {
    if (this.personForm.valid) {
      const data = { ...this.personForm.value };

      if (this.showSubcommittee && this.personForm.get('subcommitteeId')?.value) {
        data.committeeId = this.personForm.get('subcommitteeId')?.value;
      }

      delete data.subcommitteeId;

      this.personService.createPerson(data).subscribe({
        next: (res) => {
          alert('Registro exitoso: ' + res.msg);
          this.router.navigate(['/person']);
        },
        error: (err) => {
          alert('Error: ' + (err.error?.msg || 'Error en el servidor'));
        }
      });
    } else {
      alert('Por favor, completa todos los campos obligatorios');
    }
  }
}