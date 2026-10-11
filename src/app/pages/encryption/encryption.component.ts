import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EncryptionService } from '../../core/services/encryption.service';

@Component({
  imports: [FormsModule],
  selector: 'app-encryption',
  styleUrl: './encryption.component.css',
  templateUrl: './encryption.component.html',
})
export class EncryptionComponent {


  private encryptionService = inject(EncryptionService);

  inputText = '';
  outputText = '';
  errorMessage = '';

  async encryptText(): Promise<void> {

    this.errorMessage = '';

    if (!this.inputText.trim()) {
      this.errorMessage = 'Please enter data to encrypt.';
      return;
    }

    try {

      let data: unknown;

      // Try to parse JSON first
      try {
        data = JSON.parse(this.inputText);
      } catch {
        // Treat plain text as a string
        data = this.inputText;
      }

      this.outputText =
        await this.encryptionService.encrypt(data);

    } catch (error) {

      console.error('Encryption failed:', error);

      this.errorMessage =
        'Failed to encrypt the provided data.';
    }
  }

  async decryptText(): Promise<void> {

    this.errorMessage = '';

    if (!this.inputText.trim()) {
      this.errorMessage = 'Please enter encrypted data.';
      return;
    }

    try {

      const result =
        await this.encryptionService.decrypt<unknown>(
          this.inputText.trim()
        );

      if (result === null) {
        this.errorMessage =
          'Unable to decrypt the data. Check the encrypted value.';
        this.outputText = '';
        return;
      }

      // Pretty-print JSON
      if (typeof result === 'object') {
        this.outputText =
          JSON.stringify(result, null, 2);
      } else {
        this.outputText = String(result);
      }

    } catch (error) {

      console.error('Decryption failed:', error);

      this.errorMessage =
        'Failed to decrypt the provided data.';

      this.outputText = '';
    }
  }

  clear(): void {
    this.inputText = '';
    this.outputText = '';
    this.errorMessage = '';
  }

}
