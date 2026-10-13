import { Component, inject } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
@Component({
  imports: [PageBreadcrumbComponent],
  selector: 'app-referal-network',
  styleUrl: './referal-network.component.css',
  templateUrl: './referal-network.component.html',
})
export class ReferalNetworkComponent {

  readonly commonService = inject(CommonService);

  ngOnInit(){
    this.getTransactionHistory();
    
  }

  getTransactionHistory(): void {
    // this.isLoading.set(true);

    this.commonService.fetchBdoNetwork().subscribe({
      next: (response) => {
        const data = response?.data ?? response;

        // this.mainBalance.set(Number(data?.main_wallet) || 0);
        // this.pendingBalance.set(Number(data?.pending_wallet) || 0);

        // this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching transaction history:', error);
        // this.isLoading.set(false);
      },
    });
  }
}
