import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { EncryptionService } from '../../../core/services/encryption.service';
import { WalletComponent } from '../../../pages/wallet/wallet.component';
@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleButtonComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    WalletComponent
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  private encryptionService = inject(EncryptionService);
  isApplicationMenuOpen = false;
  readonly isMobileOpen$;
  userData = signal<any>(null);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(public sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  async ngOnInit() {
    const encryptedUserData = sessionStorage.getItem('user');
    if (!encryptedUserData) {
      return;
    }  
    const user = await this.encryptionService.decrypt<any>(encryptedUserData);
    this.userData.set(user);
    console.log("header",this.userData());
  }
  

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };
}
