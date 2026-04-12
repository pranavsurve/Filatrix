import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="seller-orders container">
      <h1>Orders</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <h3>No orders yet</h3>
          <p>When customers buy your products, orders will appear here</p>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order._id) {
            <mat-card class="order-card">
              <div class="order-header">
                <span class="order-id">Order #{{ order._id.slice(-8) | uppercase }}</span>
                <span class="status" [class]="'status-' + order.status">{{ order.status }}</span>
              </div>
              <div class="order-items">
                @for (item of order.items; track item._id) {
                  <div class="item">
                    <span class="item-name">{{ item.product?.title }} x {{ item.quantity }}</span>
                    <span class="item-price">\${{ (item.price * item.quantity).toFixed(2) }}</span>
                  </div>
                }
              </div>
              <div class="order-footer">
                <span>{{ order.createdAt | date:'medium' }}</span>
                <span class="total">Total: \${{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .seller-orders {
      h1 { margin-bottom: 2rem; }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; margin-bottom: 1rem; }
        h3 { margin-bottom: 0.5rem; }
        p { color: #666; }
      }

      .orders-list { display: flex; flex-direction: column; gap: 1rem; }

      .order-card {
        padding: 1.5rem;

        .order-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;

          .status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            &.status-pending { background: #fff3e0; color: #e65100; }
            &.status-paid { background: #e3f2fd; color: #1565c0; }
            &.status-shipped, &.status-delivered { background: #e8f5e9; color: #2e7d32; }
          }
        }

        .order-items {
          margin-bottom: 1rem;

          .item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
          }
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 0.875rem;

          .total { font-weight: 700; color: #3f51b5; }
        }
      }
    }
  `]
})
export class SellerOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getSellerOrders().subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}