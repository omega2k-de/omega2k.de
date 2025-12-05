import { inject, Injectable, InjectionToken } from '@angular/core';
import CryptoJS from 'crypto-js';
import { WINDOW } from '../tokens';

export const LOCAL_STORAGE_ENCRYPTION_KEY = new InjectionToken<string | null>(
  'LocalStorageEncryptionKey',
  {
    providedIn: 'root',
    factory: () => null,
  }
);

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  static readonly separator = '"""';
  private readonly key: string | null = inject(LOCAL_STORAGE_ENCRYPTION_KEY);
  private readonly window?: Window = inject(WINDOW);

  get ts(): number {
    return Date.now();
  }

  public save(key: string, value: string) {
    const data = this.encrypt(`${value}${LocalStorageService.separator}${this.ts}`);
    this.window?.localStorage.setItem(key, data);
  }

  public get(key: string, timeoutMs?: number): string | null {
    const data = this.decrypt(this.window?.localStorage.getItem(key) ?? null);
    const parts = data?.split(LocalStorageService.separator) ?? [];
    const timestamp = Number(parts[1]);
    return Number.isInteger(timestamp) && timeoutMs && this.ts - timestamp > timeoutMs
      ? null
      : parts?.[0] || null;
  }

  public remove(key: string) {
    return this.window?.localStorage.removeItem(key);
  }

  private encrypt(text: string): string {
    return this.key ? CryptoJS.AES.encrypt(text, this.key).toString() : text;
  }

  private decrypt(text: string | null): string | null {
    return this.key && null !== text
      ? CryptoJS.AES.decrypt(text, this.key).toString(CryptoJS.enc.Utf8)
      : text;
  }
}
