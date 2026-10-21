import { Component, inject, signal,computed } from '@angular/core';
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

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  imports: [PageBreadcrumbComponent,
    BasicTableOneComponent,
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,],
  selector: 'app-packages',
  styleUrl: './packages.component.css',
  templateUrl: './packages.component.html',
})
export class PackagesComponent {

  private commonService = inject(CommonService);
  private router = inject(Router);
  private encryptionService = inject(EncryptionService);
  public modalService = inject(ModalService);
  private fb = inject(FormBuilder);
  public alertService = inject(AlertService);
  public permissionService = inject(PermissionService);

  dataArr = signal<any[]>([]);
  isSubmitting = signal(false);
  isLoading = signal(true);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  editingPackageId = signal<number | null>(null);
  userRole = signal<string>('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: ['', [Validators.required]],
    status: [true],
  });

  columns: any[] = [
    {
      field: 'name',
      headerName: 'Package Name',
      minWidth: 180,
      flex: 1.2,
    },
    {
      field: 'price',
      headerName: 'Package Price',
      minWidth: 220,
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
      field: 'status',
      headerName: 'Package Status',
      minWidth: 130,

      cellRenderer: (params: any) => {
        const isActive = params.data?.status === true;

        const badge = document.createElement('span');

        badge.className = isActive
          ? 'inline-flex items-center rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400'
          : 'inline-flex items-center rounded-full bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-400';

        badge.textContent = isActive ? 'Active' : 'Inactive';

        return badge;
      }
    }
  ];

  readonly allActions: any[] = [
    {
      key: 'edit',
      icon: 'bi-pencil',
      label: 'Edit',
      permission: 'packages.edit',
      handler: (item: any) => this.onEdit(item)
    },
    {
      key: 'request-activation',
      text: 'Request',
      icon: 'bi bi-arrow-bar-right',
      label: 'Package Activation',
      permission: 'activation-requests.view',
      hideForAdmin: true,
      handler: (item: any) => this.onPackageActivation(item)
    },
    {
      key: 'delete',
      icon: 'bi bi-trash',
      label: 'Delete Package',
      permission: 'packages.delete',
      handler: (item: any) => this.onDelete(item)
    }
  ];

  readonly actions = computed(() =>
  this.allActions.filter(action => {
    const hasPermission = this.permissionService.has(action.permission);
    const isHiddenForAdmin = action.hideForAdmin && this.userRole() === 'Super Admin';

    return hasPermission && !isHiddenForAdmin;
})
);


  async ngOnInit(): Promise<void> {
  await this.permissionService.loadPermissions();
  const encryptedUser = sessionStorage.getItem('user');

  if (encryptedUser) {
    const user = await this.encryptionService.decrypt<any>(encryptedUser);
    this.userRole.set(user?.role ?? '');
  }


  // console.log('Permissions loaded:', this.permissionService.getAll());
  console.log('Actions:', this.actions());

  this.getPackageList();
}

  getPackageList() {
    this.isLoading.set(true);
    this.commonService.getPackageList().subscribe({
      next: (response) => {
        this.dataArr.set(
          Array.isArray(response?.packages) ? [...response.packages] : []
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching Package List:', error);
        this.dataArr.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const payload: Record<string, unknown> = {
      name: formValue.name,
      price: formValue.price,
    };

    // Send status only while editing
    if (this.isEditMode()) {
      payload['status'] = formValue.status;
      this.isSubmitting.set(true);
      this.commonService.updatePackage(this.editingPackageId(), payload).subscribe({
        next: () => {
          this.alertService.success(
            'Package updated successfully.',
            'Success'
          );
          this.isSubmitting.set(false);
          this.closeModal();
          this.getPackageList();
        },
        error: (error) => {
          this.alertService.error(
            error?.error?.message || 'Failed to update package.',
            'error'
          );
          this.isSubmitting.set(false);
          console.error('Error updating package:', error);
        },
      });
    } else {
      this.isSubmitting.set(true);
      this.commonService.createPackage(payload).subscribe({
        next: () => {
          this.alertService.success(
            'Package created successfully.',
            'Success'
          );
          this.isSubmitting.set(false);
          this.closeModal();
          this.getPackageList();
        },
        error: (error) => {
          this.alertService.error(
            error?.error?.message || 'Failed to create package.',
            'error'
          );
          this.isSubmitting.set(false);
          console.error('Error creating package:', error);
        },
      });
    }

    // console('Package Payload:', payload);

    
  }

  onDelete(row: any): void {
    const packageId = row?.id;

    if (!packageId) {
      this.alertService.error(
        'Invalid package selected.',
        'Error'
      );
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this package?'
    );

    if (!confirmed) {
      return;
    }
    this.isLoading.set(true);
    this.commonService.deletePackage(packageId).subscribe({
    next: () => {
      this.isLoading.set(false);
      this.alertService.success(
        'Package deleted successfully.',
        'Success'
      );

      this.getPackageList();
    },
    error: (error) => {
      this.alertService.error(
        error?.error?.message || 'Failed to delete package.',
        'Error'
      );
      this.isLoading.set(false);
      console.error('Error deleting package:', error);
    }
  });


  }

  onPackageActivation(row: any): void {
    const packageId = row?.id;

    if (!packageId) {
      this.alertService.error(
        'Invalid package selected.',
        'Error'
      );
      return;
    }
    this.isLoading.set(true);
    this.commonService.activatePackage(packageId).subscribe({
      next: (response) => {
        this.alertService.success(
          'Package activation request sent successfully.',
          'Success'
        );
        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Package activation error:', error);
        this.isLoading.set(false);
        this.alertService.error(
          error?.error?.message ||
          'Failed to send package activation request.',
          'Error'
        );
      }
    });
  }

  onAddBtnClick() {
    this.resetFormForCreate();
    this.isModalOpen.set(true);
  }

  toggleModal() {
    if (this.isModalOpen()) {
      this.closeModal();
    } else {
      this.isModalOpen.set(true);
    }
  }

  closeModal() {
    if (!this.isSubmitting()){
      this.isModalOpen.set(false);
      this.resetFormForCreate();
    }
  }

  resetFormForCreate() {
    this.isEditMode.set(false);
    this.editingPackageId.set(null);

    this.form.reset({
      name: '',
      price: '',
      status: true,
    });
  }

  onEdit(row: any) {
    this.isEditMode.set(true);
    this.editingPackageId.set(row.id);

    this.isModalOpen.set(true);

    setTimeout(() => {
      this.form.patchValue({
        name: row.name ?? '',
        price: row.price ?? '',
        status: row.status ?? false,
      });
    });
  }
}
