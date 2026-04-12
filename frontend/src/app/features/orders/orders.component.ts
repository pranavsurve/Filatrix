import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="orders-container container">
      <h1>My Orders</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <a mat-raised-button color="primary" routerLink="/marketplace">Browse Marketplace</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order._id) {
            <mat-card class="order-card" routerLink="/order/{{ order._id }}">
              <div class="order-header">
                <span class="order-id">Order #{{ order._id.slice(-8) | uppercase }}</span>
                <span class="order-status" [class]="'status-' + order.status">{{ order.status }}</span>
              </div>
              <div class="order-items">
                @for (item of order.items?.slice(0, 3); track item._id) {
                  <div class="order-item">
                    @if (item.product?.thumbnail) {
                      <img [src]="item.product.thumbnail" [alt]="item.product?.title">
                    } @else {
                      <mat-icon>3d_rotation</mat-icon>
                    }
                    <span>{{ item.product?.title }} x {{ item.quantity }}</span>
                  </div>
                }
                @if ((order.items?.length || 0) > 3) {
                  <span class="more-items">+{{ order.items!.length - 3 }} more</span>
                }
              </div>
              <div class="order-footer">
                <span class="order-date">{{ order.createdAt | date:'medium' }}</span>
                <span class="order-total">\${{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-container {
      h1 { margin-bottom: 2rem; }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;

        mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; margin-bottom: 1rem; }
        h3 { margin-bottom: 0.5rem; }
        p { color: #666; margin-bottom: 1.5rem; }
      }

      .orders-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .order-card {
        padding: 1.5rem;
        cursor: pointer;
        transition: box-shadow 0.2s;

        &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

        .order-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;

          .order-id { font-weight: 600; }
          .order-status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;

            &.status-pending { background: #fff3e0; color: #e65100; }
            &.status-paid, &.status-processing { background: #e3f2fd; color: #1565c0; }
            &.status-shipped, &.status-delivered { background: #e8f5e9; color: #2e7d32; }
            &.status-cancelled { background: #ffebee; color: #c62828; }
          }
        }

        .order-items {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;

          .order-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            img {
              width: 40px;
              height: 40px;
              border-radius: 4px;
              object-fit: cover;
            }

            mat-icon { color: #ccc; }
          }

          .more-items { color: #666; font-size: 0.875rem; }
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 0.875rem;

          .order-total { font-weight: 700; color: #3f51b5; }
        }
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}