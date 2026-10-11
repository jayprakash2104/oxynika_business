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

  isInfoModalOpen = false;

  openInfoModal() {
    this.isInfoModalOpen = true;
  }

  groupedPermissions = computed(() => {
    const permissions = this.user()?.permissions ?? [];
  
    const grouped: Record<string, string[]> = {};
  
    permissions.forEach((permission: string) => {
      const [module, action] = permission.split('.');
  
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

  // Example user data (could be made dynamic)
  // user = {
  //   firstName: 'Chowdury',
  //   lastName: 'Musharof',
  //   role: 'Team Manager',
  //   location: 'Arizona, United States.',
  //   avatar: '/images/user/owner.png',
  //   social: {
  //     facebook: 'https://www.facebook.com/PimjoHQ',
  //     x: 'https://x.com/PimjoHQ',
  //     linkedin: 'https://www.linkedin.com/company/pimjohq',
  //     instagram: 'https://instagram.com/pimjohq',
  //   },
  //   email: 'randomuser@pimjo.com',
  //   phone: '+09 363 398 46',
  //   bio: 'Team Manager',
  // };

  handleInfoSave() {
    // console('Saving profile changes:', this.user());
  }
}
