import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="seller-products container">
      <div class="header">
        <h1>My Products</h1>
        <a mat-raised-button color="primary" routerLink="/seller/products/new">
          <mat-icon>add</mat-icon> Add Product
        </a>
      </div>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <h3>No products yet</h3>
          <p>Start selling by adding your first product</p>
          <a mat-raised-button color="primary" routerLink="/seller/products/new">Add Product</a>
        </div>
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
                <p class="price">\${{ product.price.toFixed(2) }}</p>
                <span class="status" [class]="'status-' + product.status">{{ product.status }}</span>
              </div>
              <div class="product-actions">
                <a mat-button [routerLink]="['/seller/products/edit', product._id]">
                  <mat-icon>edit</mat-icon> Edit
                </a>
                <button mat-button color="warn" (click)="deleteProduct(product._id)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .seller-products {
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; margin-bottom: 1rem; }
        h3 { margin-bottom: 0.5rem; }
        p { color: #666; margin-bottom: 1.5rem; }
      }

      .products-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

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
          .price { font-weight: 600; color: #3f51b5; margin-bottom: 0.5rem; }
          .status {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            &.status-approved { background: #e8f5e9; color: #2e7d32; }
            &.status-pending { background: #fff3e0; color: #e65100; }
            &.status-rejected { background: #ffebee; color: #c62828; }
          }
        }
      }
    }
  `]
})
export class SellerProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getSellerProducts().subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products.set(this.products().filter(p => p._id !== id));
          this.snackBar.open('Product deleted', 'Close', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    }
  }
}