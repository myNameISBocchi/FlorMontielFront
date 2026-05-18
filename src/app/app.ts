import { Component, inject, OnInit, ChangeDetectorRef, HostListener, ElementRef, Renderer2, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router'; 
import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Auth } from './services/auth'; 
import { Person } from './services/person';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, FormsModule],
  templateUrl: './app.html', 
  styleUrls: ['./app.css']
})
export class App implements OnInit {
 
  public authService = inject(Auth);
  private personService = inject(Person);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private eRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  public userData: any = null;
  public showDropdown: boolean = false;
  public isLoading: boolean = true;
  
  public sidebarOpen: boolean = false;
  public isMobile: boolean = false;
  
  public editProfile: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
   
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
    
    if (this.isMobile && this.sidebarOpen) {
      const sidebar = document.querySelector('.sidebar-mobile');
      const hamburger = document.querySelector('.hamburger-btn');
      if (sidebar && hamburger && 
          !sidebar.contains(event.target) && 
          !hamburger.contains(event.target)) {
        this.closeSidebar();
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    this.checkUserSession();
    this.checkIfMobile();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.shouldShowShell() && !this.userData) {
        this.checkUserSession();
      }
      this.cdr.detectChanges();
    });
  }

  checkIfMobile() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.sidebarOpen = true;
      } else {
        this.sidebarOpen = false;
      }
      this.cdr.detectChanges();
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (isPlatformBrowser(this.platformId)) {
      if (this.sidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  checkUserSession() {
    const personId = this.authService.getPersonId();
    if (personId && this.authService.isLoggedIn()) {
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        this.userData = JSON.parse(savedUserData);
        this.isLoading = false;
        this.cdr.detectChanges();
      } else {
        this.loadUserProfile(personId);
      }
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadUserProfile(id: string) {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.personService.getPersonById(id).subscribe({
      next: (response) => {
        if (response && response.results) {
          this.userData = response.results;
          this.userData.personId = id;
          localStorage.setItem('userData', JSON.stringify(this.userData));
          this.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al cargar perfil global:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 403 || err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }
  
  shouldShowShell(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const isNotLogin = this.router.url !== '/login';
    const notLoading = !this.isLoading;
    const hasUserData = !!this.userData;
    
    return isLoggedIn && isNotLogin && notLoading && hasUserData;
  }

  openEditProfileModal(): void {
    this.editProfile = {
      firstName: this.userData.firstName || '',
      lastName: this.userData.lastName || '',
      email: this.userData.email || '',
      phone: this.userData.phone || '',
      password: ''
    };
  }

  saveProfile(): void {
    const dataToUpdate: any = {
        firstName: this.editProfile.firstName,
        lastName: this.editProfile.lastName,
        email: this.editProfile.email,
        phone: this.editProfile.phone
    };
    
    if (this.editProfile.password && this.editProfile.password.trim() !== '') {
        dataToUpdate.password = this.editProfile.password;
    }
    
    console.log('Enviando:', dataToUpdate);
    
    const personId = this.authService.getPersonId();
    
    this.personService.updateOwnProfile(dataToUpdate).subscribe({
        next: (response) => {
            console.log('Respuesta:', response);
            Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
            if (personId) {
                this.loadUserProfile(personId);
            }
            this.showDropdown = false;
        },
        error: (err) => {
            console.error('Error:', err);
            Swal.fire('Error', err.error?.msg || 'Error al actualizar perfil', 'error');
        }
    });
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photoPerson', file);
      
      this.personService.uploadOwnPhoto(formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Foto actualizada correctamente', 'success');
          const personId = this.authService.getPersonId();
          if (personId) {
            this.loadUserProfile(personId);
          }
          this.showDropdown = false;
        },
        error: (err) => {
          Swal.fire('Error', 'Error al subir la foto', 'error');
        }
      });
    }
  }

  formatearTelefonoEdit(event: any): void {
    const input = event.target;
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
    this.editProfile.phone = formateado;
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('userData');
    this.userData = null;
    this.showDropdown = false;
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}