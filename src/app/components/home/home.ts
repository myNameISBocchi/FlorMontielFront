import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public userData: any = null;

  ngOnInit(): void {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      this.userData = JSON.parse(savedUserData);
      this.cdr.detectChanges();
    } else {
      const personId = localStorage.getItem('personId');
      if (!personId) {
        this.logout();
      }
    }
  }

  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']);
  }
}