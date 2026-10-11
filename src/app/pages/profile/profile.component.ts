import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncryptionService } from '../../core/services/encryption.service';
import { ProfilePageConfig } from '../../core/interfaces/ProfilePageConfig';

import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserAddressCardComponent,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  twoFactorEnabled = false;
  private route = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);
  pageTitle = signal('User Profile');
  sections = signal<any>(null);

  async ngOnInit() {
    const encryptedData = this.route.snapshot.queryParamMap.get('data');
    if (!encryptedData) {return;}
    const data = await this.encryptionService.decrypt<ProfilePageConfig>(encryptedData);
    // console('Decrypted profile data:', data);
    if (!data) {return;}
    this.pageTitle.set(data.pageTitle);
    this.sections.set(data.sections);
    // console('Sections:', this.sections(), 'Page Title:', this.pageTitle());
  }
}
