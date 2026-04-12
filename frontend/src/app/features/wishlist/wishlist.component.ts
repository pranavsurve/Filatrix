import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="wishlist-container container">
      <h1>My Wishlist</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <mat-icon>favorite</mat-icon>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist</p>
          <a mat-raised-button color="primary" routerLink="/marketplace">Browse Marketplace</a>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products(); track product._id) {
            <mat-card class="product-card" routerLink="/product/{{ product._id }}">
              <div class="product-image">
                @if (product.thumbnail) {
                  <img [src]="product.thumbnail" [alt]="product.title">
                } @else {
                  <mat-icon>3d_rotation</mat-icon>
                }
              </div>
              <mat-card-content>
                <h3>{{ product.title }}</h3>
                <p class="price">\${{ product.price.toFixed(2) }}</p>
                <p class="seller">by {{ product.seller?.name }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="warn" (click)="removeFromWishlist(product._id, $event)">
                  <mat-icon>delete</mat-icon>
                  Remove
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .wishlist-container {
      h1 { margin-bottom: 2rem; }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; margin-bottom: 1rem; }
        h3 { margin-bottom: 0.5rem; }
        p { color: #666; margin-bottom: 1.5rem; }
      }

      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
      }

      .product-card {
        cursor: pointer;
        transition: transform 0.2s;

        &:hover { transform: translateY(-4px); }

        .product-image {
          height: 180px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;

          img { width: 100%; height: 100%; object-fit: cover; }
          mat-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #ccc; }
        }

        h3 { font-size: 1.125rem; margin: 1rem 0 0.5rem; }
        .price { font-size: 1.25rem; font-weight: 700; color: #3f51b5; }
        .seller { font-size: 0.875rem; color: #666; }
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  constructor(
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.products.set(res.wishlist.products || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  removeFromWishlist(productId: string, event: Event): void {
    event.stopPropagation();
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.products.set(this.products().filter(p => p._id !== productId));
      },
      error: () => this.snackBar.open('Failed to remove', 'Close', { duration: 2000 })
    });
  }
}