import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  // 32-byte key as Base64.
  private readonly SECRET_KEY = 'K7@vQ2#nL9!xR4$mT8^pZ1&cW6*eY3%a';

  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  /**
   * Encrypt any JSON-serializable data.
   */
  async encrypt(data: unknown): Promise<string> {
    const key = await this.getKey();

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encodedData = this.encoder.encode(JSON.stringify(data));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encodedData
    );

    const encryptedBytes = new Uint8Array(encrypted);

    // IV + encrypted data
    const combined = new Uint8Array(
      iv.length + encryptedBytes.length
    );

    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return this.toBase64Url(combined);
  }

  /**
   * Decrypt encrypted route data.
   */
  async decrypt<T>(encryptedData: string): Promise<T | null> {
    try {
      const key = await this.getKey();

      const combined = this.fromBase64Url(encryptedData);

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encrypted
      );

      return JSON.parse(
        this.decoder.decode(decrypted)
      ) as T;

    } catch (error) {
      console.error('Unable to decrypt data');

      return null;
    }
  }

  private async getKey(): Promise<CryptoKey> {

    const keyData = this.encoder.encode(this.SECRET_KEY);

    return crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM'
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private toBase64Url(bytes: Uint8Array): string {
    let binary = '';

    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private fromBase64Url(value: string): Uint8Array {
    const base64 = value
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = base64.padEnd(
      base64.length + ((4 - base64.length % 4) % 4),
      '='
    );

    const binary = atob(padded);

    return Uint8Array.from(binary, char => char.charCodeAt(0));
  }
}