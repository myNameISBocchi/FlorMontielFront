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
      roleId: ['[]'],
      password: ['']
    });
  }

  cargarDatos() {
    this.personService.getComunity().subscribe(res => {
      this.comunity = res.result || res.results || res;
    });

    this.personService.getCouncil().subscribe(res => {
      this.council = res.result || res.results || res;
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
      this.personService.createPerson(this.personForm.value).subscribe({
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