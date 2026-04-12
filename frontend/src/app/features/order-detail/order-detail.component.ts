import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="order-detail container">
      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else if (order()) {
        <div class="breadcrumb">
          <a routerLink="/orders">Orders</a>
          <mat-icon>chevron_right</mat-icon>
          <span>Order #{{ order()!._id.slice(-8) | uppercase }}</span>
        </div>

        <div class="order-content">
          <div class="order-main">
            <mat-card>
              <h2>Items</h2>
              <div class="items-list">
                @for (item of order()!.items; track item._id) {
                  <div class="item">
                    <div class="item-image">
                      @if (item.product?.thumbnail) {
                        <img [src]="item.product.thumbnail" [alt]="item.product?.title">
                      } @else {
                        <mat-icon>3d_rotation</mat-icon>
                      }
                    </div>
                    <div class="item-details">
                      <h4>{{ item.product?.title }}</h4>
                      <p>Quantity: {{ item.quantity }} x \${{ item.price.toFixed(2) }}</p>
                    </div>
                    <div class="item-actions">
                      @if (!item.isDownloaded && canDownload()) {
                        <button mat-stroked-button (click)="markDownloaded(item._id)">
                          <mat-icon>download</mat-icon>
                          Download
                        </button>
                      } @else if (item.isDownloaded) {
                        <span class="downloaded">
                          <mat-icon>check_circle</mat-icon>
                          Downloaded
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </mat-card>
          </div>

          <div class="order-sidebar">
            <mat-card>
              <h3>Order Status</h3>
              <p class="status" [class]="'status-' + order()!.status">{{ order()!.status | titlecase }}</p>
              @if (order()!.trackingNumber) {
                <p class="tracking">Tracking: {{ order()!.trackingNumber }}</p>
              }
            </mat-card>

            <mat-card>
              <h3>Shipping Address</h3>
              <p>{{ order()!.shippingAddress.fullName }}</p>
              <p>{{ order()!.shippingAddress.street }}</p>
              <p>{{ order()!.shippingAddress.city }}, {{ order()!.shippingAddress.state }} {{ order()!.shippingAddress.zipCode }}</p>
              <p>{{ order()!.shippingAddress.country }}</p>
            </mat-card>

            <mat-card>
              <h3>Order Total</h3>
              <div class="total-row">
                <span>Subtotal</span>
                <span>\${{ getSubtotal().toFixed(2) }}</span>
              </div>
              <div class="total-row grand">
                <span>Total</span>
                <span>\${{ order()!.totalAmount.toFixed(2) }}</span>
              </div>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .order-detail {
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
        font-size: 0.875rem;

        a { color: #3f51b5; text-decoration: none; }
      }

      .order-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 2rem;

        @media (max-width: 768px) { grid-template-columns: 1fr; }
      }

      .order-main mat-card, .order-sidebar mat-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
      }

      .items-list {
        .item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #eee;

          &:last-child { border-bottom: none; }

          .item-image {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            overflow: hidden;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;

            img { width: 100%; height: 100%; object-fit: cover; }
            mat-icon { color: #ccc; }
          }

          .item-details {
            flex: 1;
            h4 { margin-bottom: 0.25rem; }
            p { color: #666; font-size: 0.875rem; }
          }

          .downloaded {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            color: #4caf50;
            font-size: 0.875rem;
            mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
          }
        }
      }

      .status {
        font-size: 1.25rem;
        font-weight: 600;

        &.status-pending { color: #e65100; }
        &.status-paid, &.status-processing { color: #1565c0; }
        &.status-shipped, &.status-delivered { color: #2e7d32; }
        &.status-cancelled { color: #c62828; }
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;

        &.grand {
          font-size: 1.25rem;
          font-weight: 700;
          border-top: 1px solid #eee;
          margin-top: 0.5rem;
          padding-top: 1rem;
        }
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.router.url.split('/').pop();
    if (id) {
      this.orderService.getOrder(id).subscribe({
        next: (res) => {
          this.order.set(res.order);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/orders']);
        }
      });
    }
  }

  getSubtotal(): number {
    return this.order()?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  }

  canDownload(): boolean {
    const status = this.order()?.status;
    return status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered';
  }

  markDownloaded(itemId: string): void {
    const orderId = this.order()!._id;
    this.orderService.markDownloaded(orderId, itemId).subscribe({
      next: () => {
        const order = this.order()!;
        const item = order.items.find(i => i._id === itemId);
        if (item) item.isDownloaded = true;
        this.order.set({ ...order });
        this.snackBar.open('Download marked', 'Close', { duration: 2000 });
      }
    });
  }
}