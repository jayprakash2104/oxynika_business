
import { Component, inject } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../../core/services/alert.service';
import { finalize } from 'rxjs';
import { EncryptionService } from '../../../../core/services/encryption.service';
@Component({
  selector: 'app-signin-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    ReactiveFormsModule
],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private encryptionService = inject(EncryptionService);

  signinForm: FormGroup = this.fb.group({
    email: ['', [
        Validators.required,
        Validators.email
      ]
    ],
    password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]
    ],
    rememberMe: [false]
  })

  showPassword = false;
  isLoading = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    this.signinForm.markAllAsTouched();

    // Stop if form is invalid
    if (this.signinForm.invalid) {
      return;
    }

    const { email, password, rememberMe } = this.signinForm.getRawValue();

    const payload = {
      email: email.trim(),
      password,
      rememberMe
    };
    this.isLoading = true;
    this.authService.login(payload)
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: async (response) => { 

        const userData = {
          ...response.user,
          role: response.role
        };

        const permissions = response?.permissions ?? [];
        sessionStorage.setItem('permissions', await this.encryptionService.encrypt(permissions));

        // Store token
        const encryptedUserData = await this.encryptionService.encrypt(userData);
        const encryptedToken = await this.encryptionService.encrypt(response.token);
        sessionStorage.setItem('token', encryptedToken);
        sessionStorage.setItem('user', encryptedUserData);

        // Navigate after successful login
        this.router.navigate(['/dashboard']);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Login failed:', error);
          this.alertService.error(error?.error?.message || 'An error occurred', 'Error', 'right');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signinForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
