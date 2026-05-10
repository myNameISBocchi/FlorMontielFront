import { Component, inject, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { Auth } from './services/auth'; 
import { Person } from './services/person';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.html', 
  styleUrls: ['./app.css']
})
export class App implements OnInit {
 
  public authService = inject(Auth);
  private personService = inject(Person);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private eRef = inject(ElementRef);

  public userData: any = null;
  public showDropdown: boolean = false;
  public isLoading: boolean = true;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    this.checkUserSession();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.shouldShowShell() && !this.userData) {
        this.checkUserSession();
      }
      this.cdr.detectChanges();
    });
  }

  checkUserSession() {
    const personId = this.authService.getPersonId();
    if (personId && this.authService.isLoggedIn()) {
      this.loadUserProfile(personId);
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
          this.isLoading = false;
          console.log('Perfil global cargado:', this.userData);
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

  logout() {
    this.authService.logout();
    this.userData = null;
    this.showDropdown = false;
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}