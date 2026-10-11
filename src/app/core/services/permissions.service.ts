import { Injectable, inject, signal } from '@angular/core';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private encryptionService = inject(EncryptionService);

  private permissions = signal<string[]>([]);

  constructor() {
    this.loadPermissions();
  }

  async loadPermissions(): Promise<void> {
    const encryptedUser = sessionStorage.getItem('permissions');

    if (!encryptedUser) {
      this.permissions.set([]);
      return;
    }

    try {
      const permissions = await this.encryptionService.decrypt<any>(
        encryptedUser
      );
      console.log('permissions', permissions);
      this.permissions.set(
        Array.isArray(permissions)
          ? permissions
          : []
      );

    } catch (error) {
      console.error('Failed to load permissions', error);
      this.permissions.set([]);
    }
  }

  has(permission: string): boolean {
    // console(permission, this.permissions().includes(permission));
    return this.permissions().includes(permission);
  }

  clear(): void {
    this.permissions.set([]);
  }
}