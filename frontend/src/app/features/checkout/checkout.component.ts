import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../shared/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  items = signal<CartItem[]>([]);
  loading = signal(true);
  placingOrder = signal(false);

  shippingAddress = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
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

  total(): number {
    return this.items().reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }

  placeOrder(): void {
    const { fullName, street, city, state, zipCode, country } = this.shippingAddress;
    if (!fullName || !street || !city || !state || !zipCode || !country) {
      this.snackBar.open('Please fill in all shipping fields', 'Close', { duration: 3000 });
      return;
    }

    this.placingOrder.set(true);

    this.orderService.createOrder(this.shippingAddress).subscribe({
      next: (res) => {
        this.placingOrder.set(false);
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/order', res.order._id]);
      },
      error: (err) => {
        this.placingOrder.set(false);
        this.snackBar.open(err.error?.message || 'Failed to place order', 'Close', { duration: 3000 });
      }
    });
  }
}