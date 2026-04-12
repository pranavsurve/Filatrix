import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="admin-products container">
      <h1>Manage Products</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="products-list">
          @for (product of products(); track product._id) {
            <mat-card class="product-card">
              <div class="product-image">
                @if (product.thumbnail) {
                  <img [src]="product.thumbnail" [alt]="product.title">
                } @else {
                  <mat-icon>3d_rotation</mat-icon>
                }
              </div>
              <div class="product-info">
                <h3>{{ product.title }}</h3>
                <p class="seller">by {{ product.seller?.name }}</p>
                <span class="status" [class]="'status-' + product.status">{{ product.status }}</span>
              </div>
              <div class="product-actions">
                @if (product.status === 'pending') {
                  <button mat-raised-button color="primary" (click)="approveProduct(product._id)">
                    Approve
                  </button>
                  <button mat-stroked-button color="warn" (click)="rejectProduct(product._id)">
                    Reject
                  </button>
                } @else {
                  <span class="status-label">{{ product.status | titlecase }}</span>
                }
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-products {
      h1 { margin-bottom: 2rem; }

      .products-list { display: flex; flex-direction: column; gap: 1rem; }

      .product-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1rem;

        .product-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;

          img { width: 100%; height: 100%; object-fit: cover; }
          mat-icon { color: #ccc; }
        }

        .product-info {
          flex: 1;
          h3 { margin-bottom: 0.25rem; }
          .seller { color: #666; font-size: 0.875rem; margin-bottom: 0.5rem; }
          .status {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            &.status-approved { background: #e8f5e9; color: #2e7d32; }
            &.status-pending { background: #fff3e0; color: #e65100; }
            &.status-rejected { background: #ffebee; color: #c62828; }
          }
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
        }
      }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getAllProducts().subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approveProduct(id: string): void {
    this.adminService.updateProductStatus(id, 'approved').subscribe({
      next: () => {
        this.updateProductStatus(id, 'approved');
        this.snackBar.open('Product approved', 'Close', { duration: 2000 });
      }
    });
  }

  rejectProduct(id: string): void {
    this.adminService.updateProductStatus(id, 'rejected').subscribe({
      next: () => {
        this.updateProductStatus(id, 'rejected');
        this.snackBar.open('Product rejected', 'Close', { duration: 2000 });
      }
    });
  }

  private updateProductStatus(id: string, status: string): void {
    this.products.update(list =>
      list.map(p => p._id === id ? { ...p, status } : p)
    );
  }
}