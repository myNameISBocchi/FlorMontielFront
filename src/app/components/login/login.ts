import { Component, inject } from "@angular/core"; 
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { Auth } from "../../services/auth"; 
import { Router } from "@angular/router"; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css' 
})
export class Login {
  loginForm: FormGroup;

  private authService = inject(Auth);
  private router = inject(Router);

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.results && response.results.length > 0) {
            const data = response.results[0];

            localStorage.setItem('auth_token', data.token);
            
            if (data.personId) {
              localStorage.setItem('personId', data.personId.toString());
            }

            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              text: 'Login exitoso',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.href = '/home';
            });
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error de acceso',
            text: 'Credenciales incorrectas o error de conexión con el servidor'
          });
        }
      });
    } else {
      this.loginForm.markAllAsTouched(); 
    }
  }

  isFieldInvalid(field: string) {
    const control = this.loginForm.get(field);
    return control ? control.invalid && control.touched : false;
  }
}