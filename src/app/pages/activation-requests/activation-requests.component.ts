import { Component, inject, signal, computed } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BasicTableOneComponent } from '../../shared/components/tables/basic-tables/basic-table-one/basic-table-one.component';
import { CommonService } from '../../core/services/common.service';
import { Router } from '@angular/router';
import { EncryptionService } from '../../core/services/encryption.service';
import { ModalService } from '../../shared/services/modal.service';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { AlertService } from '../../core/services/alert.service';
import { PermissionService } from '../../core/services/permissions.service';

@Component({
  imports: [PageBreadcrumbComponent,
    BasicTableOneComponent,
  ],
  selector: 'app-activation-requests',
  styleUrl: './activation-requests.component.css',
  templateUrl: './activation-requests.component.html',
})
export class ActivationRequestsComponent {
  private commonService = inject(CommonService);
  private router = inject(Router);
  private encryptionService = inject(EncryptionService);
  public modalService = inject(ModalService);
  public alertService = inject(AlertService);
  public permissionService = inject(PermissionService);

  dataArr = signal<any[]>([]);
  bdoDataArr = signal<any[]>([]);
  isLoading = signal(true);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  userRole = signal<string>('');
  editingPackageId = signal<number | null>(null);

  columns: any[] = [
    {
      field: 'package.name',
      headerName: 'Package Name',
      minWidth: 180,
      flex: 1.2,
      valueGetter: (params: any) => params.data?.package?.name ?? '—'
    },
    {
      field: 'amount',
      headerName: 'Package Price',
      minWidth: 180,
      flex: 1,
      valueFormatter: (params: any) => {
        if (params.value == null) {
          return '—';
        }

        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2
        }).format(Number(params.value));
      }
    },
    {
      field: 'bdo.name',
      headerName: 'Requested By',
      minWidth: 220,
      flex: 1.5,
      cellRenderer: (params: any) => {
        const bdo = params.data?.bdo;

        const container = document.createElement('div');
        container.className = 'flex flex-col';

        const name = document.createElement('span');
        name.className = 'text-sm font-medium text-gray-800 dark:text-white';
        name.textContent = bdo?.name ?? '—';

        const email = document.createElement('span');
        email.className = 'flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400';

        const emailIcon = document.createElement('i');
        emailIcon.className = 'bi bi-envelope-fill text-brand-500';

        email.textContent = bdo?.email ?? '—';
        email.prepend(emailIcon);

        container.append(name, email);

        return container;
      }
    },
    {
      field: 'status',
      headerName: 'Package Status',
      minWidth: 150,
      flex: 1,
      cellRenderer: (params: any) => {
        const status = String(params.value ?? '').toLowerCase();

        const badge = document.createElement('span');

        const statusClasses: Record<string, string> = {
          approved:
            'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400',
          pending:
            'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400',
          rejected:
            'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400'
        };

        badge.className =
          `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status] ??
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`;

        badge.textContent = status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : '—';

        return badge;
      }
    }
  ];

  bdoColumns: any[] = [
    {
      field: 'package.name',
      headerName: 'Name',
      flex: 1.2,
      minWidth: 180,
      valueGetter: (params: any) => params.data?.package?.name ?? '—'
    },
    {
      field: 'amount',
      headerName: 'Price',
      flex: 1.5,
      minWidth: 220,
      valueFormatter: (params: any) => {
        if (params.value == null || params.value === '') {
          return '—';
        }

        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2
        }).format(Number(params.value));
      }
    },
    {
      field: 'approved_by',
      headerName: 'Approved By',
      flex: 1,
      minWidth: 160,
      valueGetter: (params: any) => params.data?.approver?.name ?? '—'
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      cellRenderer: (params: any) => {
        const isActive = params.value === 'approved';

        const badge = document.createElement('span');

        badge.className = isActive
          ? 'inline-flex items-center rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400'
          : 'inline-flex items-center rounded-full bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-400';

        badge.textContent = params.value
          ? params.value.charAt(0).toUpperCase() + params.value.slice(1)
          : '—';

        return badge;
      }
    }
  ];

  allActions: any[] = [
    {
      key: 'approve',
      icon: 'bi-arrow-right-circle-fill',
      label: 'Approve',
      handler: (item: any) => this.onPackageAction(item, 1)
    },
    {
      key: 'reject',
      icon: 'bi-ban-fill',
      label: 'Reject',
      handler: (item: any) => this.onPackageAction(item, 0)
    }
  ];


  async ngOnInit(): Promise<void> {
    const encryptedUser = sessionStorage.getItem('user');

    if (encryptedUser) {
      const user = await this.encryptionService.decrypt<any>(encryptedUser);
      this.userRole.set(user?.role ?? '');
      console.log('User Role:', this.userRole());
    }

    this.userRole() === 'Super Admin'
      ? this.getRequestedPackageList()
      : this.userRole() === 'BDO'
        ? this.getRequestedPackage()
        : null;
  }

  getRequestedPackageList() {
    this.isLoading.set(true);
    this.commonService.getRequestedPackageByBDO().subscribe({
      next: (response) => {
        this.dataArr.set(
          Array.isArray(response?.activation_requests) ? [...response.activation_requests] : []
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching Activation Requests:', error);
        this.dataArr.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onPackageAction(row: any, action: number): void {
    const packageId = row?.id;

    if (!packageId) {
      this.alertService.error('Invalid package selected.', 'Error');
      return;
    }

    if (action !== 0 && action !== 1) {
      this.alertService.error('Invalid action selected.', 'Error');
      return;
    }

    const request$ = action === 1
      ? this.commonService.approveRequestedPackage(packageId)
      : this.commonService.rejectRequestedPackage(packageId);
    this.isLoading.set(true);
    request$.subscribe({
      next: () => {
        this.alertService.success(
          action === 1
            ? 'Package activation request approved successfully.'
            : 'Package activation request rejected successfully.',
          'Success'
        );
      this.isLoading.set(false);
        this.getRequestedPackageList();
      },
      error: (error) => {
        console.error('Package action error:', error);
        this.isLoading.set(false);
        this.alertService.error(
          error?.error?.message ||
          `Failed to ${action === 1 ? 'approve' : 'reject'} package activation request.`,
          'Error'
        );
      }
    });
  }

  // for bdo
  getRequestedPackage() {
    this.isLoading.set(true);
    this.commonService.getRequestedPackage().subscribe({
      next: (response) => {
        this.bdoDataArr.set(
          Array.isArray(response?.activation_requests) ? [...response.activation_requests] : []
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching BDO List:', error);
        this.bdoDataArr.set([]);
        this.isLoading.set(false);
      },
    });
  }
}

