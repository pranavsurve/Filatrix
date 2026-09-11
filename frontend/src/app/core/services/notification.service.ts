import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private wishlistPulseSubject = new Subject<void>();
  readonly wishlistPulse$ = this.wishlistPulseSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['filatrix-snackbar', 'filatrix-snackbar-success']
    });
  }

  error(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['filatrix-snackbar', 'filatrix-snackbar-error']
    });
  }

  wishlistAdded(productTitle?: string): void {
    this.wishlistPulseSubject.next();
    this.snackBar.open(
      productTitle ? `Added "${productTitle}" to wishlist` : 'Added to wishlist',
      'Close',
      {
        duration: 2500,
        panelClass: ['filatrix-snackbar', 'filatrix-snackbar-wishlist']
      }
    );
  }

  wishlistRemoved(productTitle?: string): void {
    this.snackBar.open(
      productTitle ? `Removed "${productTitle}" from wishlist` : 'Removed from wishlist',
      'Close',
      { duration: 2200, panelClass: ['filatrix-snackbar', 'filatrix-snackbar-success'] }
    );
  }

  cartAdded(productTitle?: string): void {
    this.snackBar.open(
      productTitle ? `Added "${productTitle}" to cart` : 'Added to cart',
      'Close',
      {
        duration: 2500,
        panelClass: ['filatrix-snackbar', 'filatrix-snackbar-cart']
      }
    );
  }
}
