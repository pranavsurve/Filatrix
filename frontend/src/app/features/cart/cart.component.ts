import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../shared/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  items = signal<CartItem[]>([]);
  loading = signal(true);

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.items.set(res.cart.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  subtotal(): number {
    return this.items().reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateCartItem(item._id, item.quantity + 1).subscribe({
      next: (res) => {
        this.items.set(res.cart.items);
      }
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateCartItem(item._id, item.quantity - 1).subscribe({
        next: (res) => {
          this.items.set(res.cart.items);
        }
      });
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: (res) => {
        this.items.set(res.cart.items);
      },
      error: () => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 2000 });
      }
    });
  }
}