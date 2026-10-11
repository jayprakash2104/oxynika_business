import { Component, inject, OnInit, signal, ElementRef, HostListener} from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { DecimalPipe } from '@angular/common';
import { DropdownComponent } from '../../shared/components//ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../shared/components/ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  imports: [DecimalPipe, DropdownComponent, DropdownItemComponent],
  selector: 'app-wallet',
  styleUrl: './wallet.component.css',
  templateUrl: './wallet.component.html',
})
export class WalletComponent implements OnInit {
  private commonService = inject(CommonService);
private elementRef = inject(ElementRef);

  mainBalance = signal<number>(0);
  pendingBalance = signal<number>(0);
  isLoading = signal<boolean>(true);

  isOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const clickedInside = this.elementRef.nativeElement.contains(
    event.target
  );

  if (!clickedInside && this.isOpen()) {
    this.closeDropdown();
  }
}

  toggleDropdown() {
    this.isOpen.update(open => !open);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  ngOnInit(): void {
    this.getWalletBalance();
    this.getTransactionHistory();
  }

  getWalletBalance(): void {
    this.isLoading.set(true);

    this.commonService.getWalletBalance().subscribe({
      next: (response) => {
        const data = response?.data ?? response;

        this.mainBalance.set(Number(data?.main_wallet) || 0);
        this.pendingBalance.set(Number(data?.pending_wallet) || 0);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching wallet balance:', error);
        this.isLoading.set(false);
      },
    });
  }

    getTransactionHistory(): void {
    this.isLoading.set(true);

    this.commonService.getTransactionHistory().subscribe({
      next: (response) => {
        const data = response?.data ?? response;

        this.mainBalance.set(Number(data?.main_wallet) || 0);
        this.pendingBalance.set(Number(data?.pending_wallet) || 0);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching transaction history:', error);
        this.isLoading.set(false);
      },
    });
  }

  formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  showTransactionsModal = signal(false);

transactions = signal<any[]>([
  {
    id: 'TXN-10241',
    title: 'Wallet Credit',
    description: 'Funds added to wallet',
    date: '11 Oct 2026, 10:30 AM',
    amount: 2500,
    type: 'credit',
    status: 'Completed',
  },
  {
    id: 'TXN-10240',
    title: 'Package Purchase',
    description: 'Package subscription payment',
    date: '10 Oct 2026, 04:15 PM',
    amount: 1200,
    type: 'debit',
    status: 'Completed',
  },
  {
    id: 'TXN-10239',
    title: 'Commission Received',
    description: 'Referral commission',
    date: '10 Oct 2026, 11:20 AM',
    amount: 850,
    type: 'credit',
    status: 'Pending',
  },
  {
    id: 'TXN-10238',
    title: 'Withdrawal Request',
    description: 'Bank withdrawal',
    date: '09 Oct 2026, 02:45 PM',
    amount: 1500,
    type: 'debit',
    status: 'Pending',
  },
  {
    id: 'TXN-10237',
    title: 'Wallet Credit',
    description: 'Promotional credit',
    date: '08 Oct 2026, 09:10 AM',
    amount: 500,
    type: 'credit',
    status: 'Failed',
  },
]);

openTransactions(): void {
  this.showTransactionsModal.set(true);
}

closeTransactions(): void {
  this.showTransactionsModal.set(false);
}
}
