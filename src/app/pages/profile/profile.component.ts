import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { EncryptionService } from '../../core/services/encryption.service';

import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  private encryptionService = inject(EncryptionService);

  currentUser = signal<any>(null);

async ngOnInit() {
  const encryptedUser = sessionStorage.getItem('user');

  if (!encryptedUser) {
    return;
  }

  try {
    const user = await this.encryptionService.decrypt<any>(encryptedUser);

    if (!user.permissions?.length) {
      const encryptedPermissions = sessionStorage.getItem('permissions');

      const permissions: string[] = encryptedPermissions
        ? (await this.encryptionService.decrypt<string[]>(encryptedPermissions)) ?? []
        : [];

      user.permissions = permissions;
    }

    this.currentUser.set(user);
  } catch (error) {
    console.error('Failed to decrypt user details:', error);
    this.currentUser.set(null);
  }
}
}
