import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from '../../core/services/encryption.service';

@Component({
  imports: [],
  selector: 'app-referal-banner',
  styleUrl: './referal-banner.component.css',
  templateUrl: './referal-banner.component.html',
})
export class ReferalBannerComponent {
  private readonly encryptionService = inject(EncryptionService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly registrationUrl = signal('');
  readonly showCopied = signal(false);

  readonly userData = signal<any | null>(null);

  private async createRegistrationUrl(): Promise<void> {
    const user = this.userData();

    if (!user?.referral_code) {
      this.registrationUrl.set('');
      return;
    }

    const referrer = {
      name: user.name,
      email: user.email,
      referral_code: user.referral_code,
    };

    try {
      const encrypted = await this.encryptionService.encrypt(referrer);

      this.registrationUrl.set(
        `${window.location.origin}/join?data=${encodeURIComponent(encrypted)}`
      );
    } catch (error) {
      console.error('Failed to create referral registration URL:', error);
      this.registrationUrl.set('');
    }
  }

openRegistrationForm(): void {
  const url = this.registrationUrl();

  if (!url) {
    console.error('Registration URL is not available.');
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

  readonly emailShareUrl = computed(() => {
    const user = this.userData();
    const link = this.registrationUrl();

    const subject = 'Discover an Opportunity with Oxynika';

    const body = `Hello,

I'd like to introduce you to Oxynika and invite you to explore the opportunities available to become part of our growing network.

Explore more using my personal referral link:
${link}

Feel free to visit the link to learn more. If you're interested, I'd be happy to connect with you and help you take the next step.

Best regards,

${user?.name ?? ''}
${user?.email ?? ''}
Oxynika`;

    return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });


  openEmailShare(): void {
    const url = this.emailShareUrl();

    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadUser();
  }

  private async loadUser(): Promise<void> {
    try {
      const encryptedUser = sessionStorage.getItem('user');

      if (!encryptedUser) {
        return;
      }

      const user =
        await this.encryptionService.decrypt<any>(encryptedUser);

      if (user) {
        this.userData.set(user);
        await this.createRegistrationUrl();
      }
    } catch (error) {
      console.error('Failed to load logged-in user:', error);
    }
  }

  async copyReferralLink(): Promise<void> {
    const link = this.registrationUrl();

    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      this.showCopied.set(true);

      setTimeout(() => {
        this.showCopied.set(false);
      }, 1000);

    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  }

}
