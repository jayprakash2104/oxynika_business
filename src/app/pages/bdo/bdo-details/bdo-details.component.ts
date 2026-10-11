import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../core/services/encryption.service';
import { ProfilePageConfig } from '../../../core/interfaces/ProfilePageConfig';
import { CommonService } from '../../../core/services/common.service';

import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserAddressCardComponent } from '../../../shared/components/user-profile/user-address-card/user-address-card.component';
import { UserMetaCardComponent } from '../../../shared/components/user-profile/user-meta-card/user-meta-card.component';

@Component({
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent, UserMetaCardComponent, UserAddressCardComponent],
  selector: 'app-bdo-details',
  styleUrl: './bdo-details.component.css',
  templateUrl: './bdo-details.component.html',
})
export class BdoDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);
  private commonService = inject(CommonService);
  private router = inject(Router);
  sections = signal<any>(null);
  twoFactorEnabled = false;
  isLoading = signal(true);
  subAdminDetails = signal<any>(null);

  async ngOnInit() {
    const encryptedData = this.route.snapshot.queryParamMap.get('data');
    if (!encryptedData) {return;}
    const data = await this.encryptionService.decrypt<any>(encryptedData);
    // console('Decrypted profile data:', data);
    if (!data) {return;}
    this.sections.set(data.sections);
    // console('Sections:', this.sections());
    this.getBdoDetails(data.id);
  }

  getBdoDetails(id: number | string) {
    this.isLoading.set(true);
    this.commonService.getBdoDetails(id).subscribe({
      next: (response:any) => {
        const user =
          response?.user ??
          response?.sub_admin ??
          response?.data?.user ??
          response?.data ??
          response;
        this.subAdminDetails.set({ ...response, user });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Failed to get BDO details:', error);
      },
    });
  }

  goBackToList() {
    this.router.navigateByUrl('/bdo');
  }
}
