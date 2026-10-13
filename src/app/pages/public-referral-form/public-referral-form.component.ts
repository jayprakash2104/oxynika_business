import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { EncryptionService } from '../../core/services/encryption.service';
import { CommonService } from '../../core/services/common.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-public-referral-form',
  styleUrl: './public-referral-form.component.css',
  templateUrl: './public-referral-form.component.html',
})
export class PublicReferralFormComponent {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly encryptionService = inject(EncryptionService);
  readonly currentYear = new Date().getFullYear();
  readonly commonService = inject(CommonService);
  readonly registrationUrl = signal('');

  referer = signal<any>({});
  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly passwordType = computed(() =>
    this.showPassword() ? 'text' : 'password'
  );

  readonly registrationForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(/^[\p{L}\p{M} .'-]+$/u),
    ]],

    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(150),
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
    ]],

    number: ['', [
      Validators.required,
      Validators.pattern(/^[6-9]\d{9}$/),
    ]],

    address: ['', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(250),
    ]],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const encryptedData = params.get('data');

      if (encryptedData) {
        void this.decodeReferrerData(encryptedData);
      }
    });
  }

  private async decodeReferrerData(encryptedData: string): Promise<void> {
    try {
      const referrer =
        await this.encryptionService.decrypt<{
          name?: string;
          email?: string;
          referral_code?: string;
        }>(encryptedData);

      if (!referrer) {
        throw new Error('Invalid referrer data');
      }

      this.referer.set(referrer ?? '');
    } catch (error) {
      console.error('Failed to decrypt referral data:', error);
      this.errorMessage.set(
        'This referral link is invalid or expired. Please request a new link.'
      );
    }
  }

  hasError(
    field: 'name' | 'email' | 'password' | 'number' | 'address',
    error: string
  ): boolean {
    const control = this.registrationForm.controls[field];

    return control.touched && control.hasError(error);
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  submitForm(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.referer()?.referral_code.trim()) {
      this.errorMessage.set(
        'This referral link is missing its referral code. Please use the complete link shared with you.'
      );
      return;
    }

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    const formValue = this.registrationForm.getRawValue();

    const payload = {
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
      number: formValue.number.trim(),
      address: formValue.address.trim(),
    };

    this.isSubmitting.set(true);

    this.commonService.userRegistration(payload, this.referer()?.referral_code.trim()).
    subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(
          'Your registration was submitted successfully!'
        );
        this.registrationForm.reset();
      },
      error: (error) => {
        this.isSubmitting.set(false);

        const apiMessage =
          error?.error?.message ??
          error?.error?.error ??
          '';

        this.errorMessage.set(
          apiMessage ||
          (error.status === 0
            ? 'Unable to connect to the server. Please check your connection and try again.'
            : 'Registration failed. Please check your details and try again.')
        );
      },
    });
  }

}
