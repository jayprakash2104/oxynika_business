import { Injectable, signal } from '@angular/core';

export interface AlertData {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  placement: 'left' | 'right';
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alert = signal<AlertData | null>(null);

  show(data: AlertData): void {
    this.alert.set(data);

    setTimeout(() => {
        this.clear();
    }, 3000);
  }

  success(message: string, title = 'Success', placement: 'left' | 'right' = 'right'): void {
    this.show({
      variant: 'success',
      title,
      message,
      placement
    });
  }

  error(message: string, title = 'Error', placement: 'left' | 'right' = 'right'): void {
    this.show({
      variant: 'error',
      title,
      message,
      placement
    });
  }

  warning(message: string, title = 'Warning', placement: 'left' | 'right' = 'right'): void {
    this.show({
      variant: 'warning',
      title,
      message,
      placement
    });
  }

  info(message: string, title = 'Information', placement: 'left' | 'right' = 'right'): void {
    this.show({
      variant: 'info',
      title,
      message,
      placement
    });
  }

  clear(): void {
    this.alert.set(null);
  }
}