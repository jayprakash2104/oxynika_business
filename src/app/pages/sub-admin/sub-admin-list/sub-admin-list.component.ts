import { Component, OnInit, inject, signal } from '@angular/core';
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
  selector: 'app-sub-admin-list',
  styleUrl: './sub-admin-list.component.css',
  templateUrl: './sub-admin-list.component.html',
})
export class SubAdminListComponent implements OnInit {
  private commonService = inject(CommonService);
  private router = inject(Router);
  private encryptionService = inject(EncryptionService);
  public modalService = inject(ModalService);
  private fb = inject(FormBuilder);
  public alertService = inject(AlertService);

  subAdmins = signal<any[]>([]);
  isSubmitting = signal(false);
  isLoading = signal(true);
  isModalOpen = signal(false);
  permissionMenus = signal<any[]>([]);
  isEditMode = signal(false);
  editingSubAdminId = signal<number | null>(null);

  subAdminForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    permissions: this.fb.array([]),
  });

  columns:any = [
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
      field: 'permissions',
      headerName: 'Permission',
      valueGetter: (params: any) => {
        if (
          params.data?.permissions !== undefined &&
          params.data?.permissions !== null
        ) {
          return `${params.data.permissions.length} Assigned`;
        }

        return '—';
      },
      flex: 1,
      minWidth: 160,
    }    
  ]

  actions: any[] = [
    {
    key: 'view',
    icon: 'bi-eye',
    label: 'View',
    handler: (item:any) => this.onSubAdminRowClick(item)
  },
  {
    key: 'edit',
    icon: 'bi-pencil',
    label: 'Edit',
    handler: (item:any) => this.onEditSubAdmin(item)
  },
  // {
  //   key: 'delete',
  //   icon: 'bi-trash3',
  //   label: 'Delete',
  //   handler: (item:any) => this.onDeleteSubAdmin(item)
  // }
];

  ngOnInit() {
    this.getSubAdminList();
    this.getPermissions();
  }

  getSubAdminList() {
    this.isLoading.set(true);
    this.commonService.getSubAdminList().subscribe({
      next: (response) => {
        this.subAdmins.set(
          Array.isArray(response?.sub_admins) ? [...response.sub_admins] : []
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching sub-admin items:', error);
        this.subAdmins.set([]);
        this.isLoading.set(false);
      },
    });
  }

  getPermissions() {
    this.commonService.getPermissions().subscribe({
      next: (response) => {
        const menus = Array.isArray(response?.menus) ? response.menus : [];
        this.permissionMenus.set(menus);
        this.buildPermissionForm(menus);
      },
      error: (error) => {
        console.error('Error fetching permissions:', error);
        this.permissionMenus.set([]);
        this.permissions.clear();
      },
    });
  }

  get permissions(): FormArray {
    return this.subAdminForm.get('permissions') as FormArray;
  }

  buildPermissionForm(menus: any[]) {
    this.permissions.clear();

    menus.forEach((menu) => {
      const permissionGroup = this.fb.group({
        key: [menu.key],
        name: [menu.name],
        permissions: this.fb.group(
          Object.fromEntries(
            (menu.permissions ?? []).map((permission: any) => [
              permission.key,
              !!permission.assigned,
            ])
          )
        ),
      });

      this.permissions.push(permissionGroup);
    });
  }

  /** "bdo.view" -> "bdoView" */
  private toCamelPermissionKey(key: string): string {
    return key.replace(/\.(\w)/g, (_, char: string) => char.toUpperCase());
  }

  /** Label for checkbox: "view", "edit", "delete" (not "bdoView") */
  getPermissionLabel(permission: any): string {
    if (permission?.name) {
      return String(permission.name).toLowerCase();
    }

    const key = String(permission?.key ?? '');
    if (!key) return '';

    // "bdo.view" -> "view"
    if (key.includes('.')) {
      return key.split('.').pop()!.toLowerCase();
    }

    // "bdoView" / "stockEdit" -> "view" / "edit"
    const parts = key.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');
    return (parts[parts.length - 1] ?? key).toLowerCase();
  }

  /** Normalize any permission key to camelCase for comparison */
  private normalizePermissionKey(key: string): string {
    return key.includes('.') ? this.toCamelPermissionKey(key) : key;
  }

  /** Flat payload: { bdoView: true, bdoCreate: true } (only true values) */
  private buildPermissionsPayload(): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  const menus = this.subAdminForm.getRawValue().permissions as any[];

  for (const menu of menus ?? []) {
    const permissions = menu?.permissions ?? {};

    for (const [key, value] of Object.entries(permissions)) {
      result[this.normalizePermissionKey(key)] = Boolean(value);
    }
  }

  return result;
}

 private applyAssignedPermissions(assigned: string[]): void {
  const assignedSet = new Set(
    (assigned ?? []).map(permission =>
      this.normalizePermissionKey(permission)
    )
  );

  this.permissionMenus().forEach((menu, menuIndex) => {

    const menuGroup = this.permissions.at(menuIndex) as FormGroup;

    if (!menuGroup) {
      return;
    }

    const permissionsGroup =
      menuGroup.get('permissions') as FormGroup;

    (menu.permissions ?? []).forEach((permission: any) => {

      const control = permissionsGroup.get(permission.key);

      if (!control) {
        return;
      }

      control.setValue(
        assignedSet.has(
          this.normalizePermissionKey(permission.key)
        ),
        { emitEvent: false }
      );

    });
  });
}

  private setPasswordValidators(required: boolean) {
    const password = this.subAdminForm.get('password');
    const confirmPassword = this.subAdminForm.get('confirmPassword');

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
    if (this.subAdminForm.invalid || this.isSubmitting()) {
      this.subAdminForm.markAllAsTouched();
      return;
    }

    const formValue = this.subAdminForm.getRawValue();

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
      permissions: this.buildPermissionsPayload(),
    };

    if (!this.isEditMode()) {
      payload['password'] = formValue.password;
    }

    // console('Sub Admin Payload:', payload);

    if (this.isEditMode()) {
      const id = this.editingSubAdminId();
      if (id == null) return;
      this.isSubmitting.set(true);
      this.commonService.updateSubAdmin(id, payload).subscribe({
        next: () => {
          this.alertService.success(
            'Sub admin updated successfully.',
            'Success',
            'right'
          );
          this.isSubmitting.set(false);
          this.closeModal();
          this.getSubAdminList();
        },
        error: (error) => {
          this.alertService.error(
            error?.error?.message || 'Failed to update sub admin.',
            'error'
          );
          this.isSubmitting.set(false);
          console.error('Error updating sub admin:', error);
        },
      });
      return;
    }
    this.isSubmitting.set(true);
    this.commonService.createSubAdmin(payload).subscribe({
      next: () => {
        this.alertService.success(
          'Sub admin created successfully.',
          'Success'
        );
        this.isSubmitting.set(false);
        this.closeModal();
        this.getSubAdminList();
      },
      error: (error) => {
        this.alertService.error(
          error?.error?.message || 'Failed to create sub admin.',
          'error'
        );
        this.isSubmitting.set(false);
        console.error('Error creating sub admin:', error);
      },
    });
  }

  async onSubAdminRowClick(subAdmin: any) {
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
    this.router.navigate(['/sub-admin-details'], {
      queryParams: { data: encryptedData },
    });
  }

  onAddSubAdmin() {
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
    this.isModalOpen.set(false);
    this.resetFormForCreate();
  }

  resetFormForCreate() {
    this.isEditMode.set(false);
    this.editingSubAdminId.set(null);
    this.setPasswordValidators(true);
    this.subAdminForm.reset({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    // Reset permission checkboxes to false without rebuilding structure
    this.permissionMenus().forEach((menu, menuIndex) => {
      const menuGroup = this.permissions.at(menuIndex) as FormGroup | undefined;
      if (!menuGroup) return;
      const permissionsGroup = menuGroup.get('permissions') as FormGroup;
      (menu.permissions ?? []).forEach((permission: any) => {
        permissionsGroup.get(permission.key)?.setValue(false);
      });
    });
  }

  onEditSubAdmin(subAdmin: any) {
    this.isEditMode.set(true);
    this.editingSubAdminId.set(subAdmin.id);
    this.setPasswordValidators(false);

    // Open modal first so projected inputs exist, then patch after render
    this.isModalOpen.set(true);

    setTimeout(() => {
      this.subAdminForm.patchValue({
        name: subAdmin.name ?? '',
        email: subAdmin.email ?? '',
        password: '',
        confirmPassword: '',
      });

      this.applyAssignedPermissions(subAdmin.permissions ?? []);
    });
  }

  // onDeleteSubAdmin(subAdmin: any) {
    
  // }
}
