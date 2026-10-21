import { Component, ElementRef, HostListener, OnInit, input, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

export interface Language {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  badge?: string;
}

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule]
})
export class UserDropdownComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  isOpen = false;
  subDropdownOpen = false;
  userData = input<any>(null);


  constructor(private elementRef: ElementRef) {
    effect(() => {
      // console('user inputtttt:', this.userData());
    });
  }

  ngOnInit(): void {

  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.subDropdownOpen = false;
    }
  }

  signOut(){
    this.authService.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => {
        this.clearSession();
      },

      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }

  clearSession(){
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Close dropdown
    this.closeDropdown();

    // Redirect to sign in
    this.router.navigate(['/signin'], {
      replaceUrl: true
    }).finally(() => {
      this.authService.isLoggingOut.set(false);
    });
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.subDropdownOpen = false;
  }

  toggleSubDropdown(event: Event): void {
    event.stopPropagation();
    this.subDropdownOpen = !this.subDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
