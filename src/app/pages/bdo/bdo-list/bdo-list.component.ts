import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BasicTableOneComponent } from '../../../shared/components/tables/basic-tables/basic-table-one/basic-table-one.component';
import { CommonService } from '../../../core/services/common.service';
import { Router } from '@angular/router';
import { EncryptionService } from '../../../core/services/encryption.service';
import { ModalService } from '../../../shared/services/modal.service';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AlertService } from '../../../core/services/alert.service';
import { PermissionService } from '../../../core/services/permissions.service';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  imports: [
    PageBreadcrumbComponent,
    BasicTableOneComponent,
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  selector: 'app-bdo-list',
  styleUrl: './bdo-list.component.css',
  templateUrl: './bdo-list.component.html',
})
export class BdoListComponent implements OnInit {
  private commonService = inject(CommonService);
  private router = inject(Router);
  private encryptionService = inject(EncryptionService);
  public modalService = inject(ModalService);
  private fb = inject(FormBuilder);
  public alertService = inject(AlertService);
  public permissionService = inject(PermissionService);

  dataArr = signal<any[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  editingBdoId = signal<number | null>(null);

form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', [Validators.required]],
  status: [true],
});

  columns: any[] = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1.2,
    minWidth: 180
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1.5,
    minWidth: 220
  },
  {
    field: 'referral_code',
    headerName: 'Referral Code',
    flex: 1,
    minWidth: 160,
    valueGetter: (params: any) => {
      return params.data?.referral_code || '—'
    }
  },
  {
    field: 'bdo_status',
    headerName: 'BDO Status',
    flex: 1,
    minWidth: 130,

    cellRenderer: (params: any) => {
      const isActive = params.data?.bdo_status === true;

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
  //   {
  //   key: 'view',
  //   icon: 'bi-eye',
  //   label: 'View',
  //   permission: 'bdo.view',
  //   handler: (item:any) => this.onRowClick(item)
  // },
  // {
  //   key: 'edit',
  //   icon: 'bi-pencil',
  //   label: 'Edit',
  //   permission: 'bdo.edit',
  //   handler: (item:any) => this.onEdit(item)
  // }
];

readonly actions = computed(() =>
  this.allActions.filter(action =>
    this.permissionService.has(action.permission)
  )
);

  ngOnInit() {
    this.getBdoList();
    // console('ssss',this.permissionService.has('bdo.edit'));
  }

  getBdoList() {
    this.isLoading.set(true);
    this.commonService.getBdoList().subscribe({
      next: (response) => {
        this.dataArr.set(
          Array.isArray(response?.bdos) ? [...response.bdos] : []
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching BDO List:', error);
        this.dataArr.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private setPasswordValidators(required: boolean) {
    const password = this.form.get('password');
    const confirmPassword = this.form.get('confirmPassword');

    if (required) {
      password?.setValidators([Validators.required, Validators.minLength(8)]);
      confirmPassword?.setValidators([Validators.required]);
    } else {
      password?.clearValidators();
      confirmPassword?.clearValidators();
      password?.setValue('');
      confirmPassword?.setValue('');
    }

    password?.updateValueAndValidity();
    confirmPassword?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (
      !this.isEditMode() &&
      formValue.password !== formValue.confirmPassword
    ) {
      this.alertService.error('Passwords do not match.', 'error');
      return;
    }

    const payload: Record<string, unknown> = {
      name: formValue.name,
      email: formValue.email,
    };

    if (!this.isEditMode()) {
      payload['password'] = formValue.password;
    }

    // console('Bdo Payload:', payload);

    if (this.isEditMode()) {
      const id = this.editingBdoId();
      if (id == null) return;
      // this.isSubmitting.set(true);
      // this.commonService.updateBdo(id, payload).subscribe({
      //   next: () => {
      //     this.alertService.success(
      //       'Bdo updated successfully.',
      //       'Success',
      //       'right'
      //     );
      //     this.isSubmitting.set(false);
      //     this.closeModal();
      //     this.getBdoList();
      //   },
      //   error: (error) => {
      //     this.alertService.error(
      //       error?.error?.message || 'Failed to update BDO.',
      //       'error'
      //     );
      //     this.isSubmitting.set(false);
      //     console.error('Error updating BDO:', error);
      //   },
      // });
      return;
    }
    this.isSubmitting.set(true);
    this.commonService.createBdo(payload).subscribe({
      next: () => {
        this.alertService.success(
          'Bdo created successfully.',
          'Success'
        );
        this.isSubmitting.set(false);
        this.closeModal();
        this.getBdoList();
      },
      error: (error) => {
        this.alertService.error(
          error?.error?.message || 'Failed to create bdo.',
          'error'
        );
        this.isSubmitting.set(false);
        console.error('Error creating bdo:', error);
      },
    });
  }

  async onRowClick(subAdmin: any) {
    const data = {
      id: subAdmin.id,
      sections: {
        meta: true,
        address: false,
        security: false,
        dangerZone: false,
      },
    };
    const encryptedData = await this.encryptionService.encrypt(data);
    this.router.navigate(['/bdo-details'], {
      queryParams: { data: encryptedData },
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
    if(!this.isSubmitting()){
      this.isModalOpen.set(false);
      this.resetFormForCreate();
    }
  }

  resetFormForCreate() {
    this.isEditMode.set(false);
    this.editingBdoId.set(null);
    this.setPasswordValidators(true);
    this.form.reset({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  }

  onEdit(row: any) {
    this.isEditMode.set(true);
    this.editingBdoId.set(row.id);
    this.setPasswordValidators(false);

    // Open modal first so projected inputs exist, then patch after render
    this.isModalOpen.set(true);

    setTimeout(() => {
      this.form.patchValue({
        name: row.name ?? '',
        email: row.email ?? '',
        password: '',
        confirmPassword: '',
        status: row?.bdo_status
      });
    });
  }
}
