import { Component, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``,
})
export class UserMetaCardComponent {
  /** Signal input — always read as `user()` in the template */
  user = input<any>(null);
  constructor(public modal: ModalService) {
    // Logs whenever the signal input changes (including first value)
    effect(() => {
      // console('user input:', this.user());
    });
  }

groupedPermissions = computed(() => {
  const permissions = this.user()?.permissions ?? [];

  const grouped: Record<string, string[]> = {};

  permissions.forEach((permission: any) => {
    // Support both string permissions and permission objects
    const permissionName =
      typeof permission === 'string'
        ? permission
        : permission?.name;

    if (typeof permissionName !== 'string') {
      return;
    }

    const [module, action] = permissionName.split('.');

    if (!module || !action) {
      return;
    }

    if (!grouped[module]) {
      grouped[module] = [];
    }

    grouped[module].push(action);
  });

  return grouped;
});

}
