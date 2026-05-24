import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Person } from '../../services/person';
import Swal from 'sweetalert2';

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
  ocultarPassword: boolean = true;

  goBack():void{
    this.router.navigate(['/person']);

  }

  ngOnInit(): void {
    this.cargarDatos();
    this.personForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/)]],
      identification: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['+58 ', [Validators.required, this.validarTelefonoVenezuela]],
      date: ['', [Validators.required, this.validarMayorDeEdad]],
      cityId: ['', [Validators.required]],
      comunityId: [''],
      councilId: [''],
      committeeId: [''],
      subcommitteeId: [''],
      roleId: ['[]'],
      password: ['', [Validators.required, Validators.minLength(8)]]
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

  togglePassword(): void {
    this.ocultarPassword = !this.ocultarPassword;
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
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: res.msg,
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/person']);
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.msg || 'Error en el servidor'
          });
        }
      });
    } else {
      this.personForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios'
      });
    }
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

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  formatearCedula(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.slice(0, 8);

    let valorFormateado = valor;
    if (valor.length > 0) {
      valorFormateado = new Intl.NumberFormat('es-VE').format(parseInt(valor, 10));
    }

    input.value = valorFormateado;
    this.personForm.get('identification')?.setValue(valorFormateado, { emitEvent: false });
    this.personForm.get('identification')?.markAsTouched();
    this.personForm.get('identification')?.updateValueAndValidity();
  }

  formatearTelefono(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    if (!valor.startsWith('+58 ')) {
      valor = '+58 ' + valor.replace(/^\+58\s*/, '');
    }
    let digitos = valor.substring(4).replace(/\D/g, '');
    if (digitos.startsWith('0')) {
      digitos = digitos.substring(1);
    }

    if (digitos.length > 10) digitos = digitos.slice(0, 10);

    let formateado = '+58 ';
    if (digitos.length > 0) formateado += digitos.substring(0, 3);
    if (digitos.length > 3) formateado += '-' + digitos.substring(3, 6);
    if (digitos.length > 6) formateado += '-' + digitos.substring(6, 10);

    input.value = formateado;
    this.personForm.get('phone')?.setValue(formateado, { emitEvent: false });
    this.personForm.get('phone')?.markAsTouched();
    this.personForm.get('phone')?.updateValueAndValidity();
  }
}