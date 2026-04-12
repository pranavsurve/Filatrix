import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="product-detail container">
      @if (loading()) {
        <div class="loading-spinner">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (product()) {
        <div class="breadcrumb">
          <a routerLink="/marketplace">Marketplace</a>
          <mat-icon>chevron_right</mat-icon>
          <span>{{ product()!.title }}</span>
        </div>

        <div class="product-content">
          <div class="product-images">
            <div class="main-image">
              @if (selectedImage()) {
                <img [src]="selectedImage()" [alt]="product()!.title">
              } @else {
                <div class="placeholder">
                  <mat-icon>3d_rotation</mat-icon>
                  <p>No preview available</p>
                </div>
              }
            </div>
            @if (product()!.previewImages?.length > 1) {
              <div class="thumbnail-list">
                @for (img of product()!.previewImages; track img) {
                  <button
                    class="thumbnail"
                    [class.active]="selectedImage() === img"
                    (click)="selectImage(img)">
                    <img [src]="img" [alt]="product()!.title">
                  </button>
                }
              </div>
            }
          </div>

          <div class="product-info">
            <h1>{{ product()!.title }}</h1>

            <div class="meta">
              <span class="seller">
                <mat-icon>person</mat-icon>
                by {{ product()!.seller?.name }}
              </span>
              @if (product()!.averageRating > 0) {
                <span class="rating">
                  <mat-icon>star</mat-icon>
                  {{ product()!.averageRating.toFixed(1) }}
                  ({{ product()!.reviewCount }} reviews)
                </span>
              }
              <span class="downloads">
                <mat-icon>download</mat-icon>
                {{ product()!.downloadCount }} downloads
              </span>
            </div>

            <div class="price-section">
              <span class="price">\${{ product()!.price.toFixed(2) }}</span>
              @if (product()!.fileType) {
                <span class="file-type">{{ product()!.fileType | uppercase }} files included</span>
              }
            </div>

            <p class="description">{{ product()!.description }}</p>

            <div class="tags">
              @for (tag of product()!.tags; track tag) {
                <mat-chip>{{ tag }}</mat-chip>
              }
            </div>

            @if (product()!.dimensions) {
              <div class="specs">
                <h3>Dimensions</h3>
                <p>{{ product()!.dimensions!.width }} x {{ product()!.dimensions!.height }} x {{ product()!.dimensions!.depth }} mm</p>
              </div>
            }

            @if (product()!.printSettings) {
              <div class="specs">
                <h3>Print Settings</h3>
                <ul>
                  @if (product()!.printSettings!.layerHeight) {
                    <li>Layer Height: {{ product()!.printSettings!.layerHeight }}</li>
                  }
                  @if (product()!.printSettings!.infill) {
                    <li>Infill: {{ product()!.printSettings!.infill }}</li>
                  }
                  @if (product()!.printSettings!.material) {
                    <li>Material: {{ product()!.printSettings!.material }}</li>
                  }
                </ul>
              </div>
            }

            <div class="actions">
              @if (isAuthenticated()) {
                <button mat-raised-button color="primary" (click)="addToCart()">
                  <mat-icon>add_shopping_cart</mat-icon>
                  Add to Cart
                </button>
                <button mat-stroked-button (click)="toggleWishlist()">
                  <mat-icon>{{ isInWishlist() ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ isInWishlist() ? 'Remove from Wishlist' : 'Add to Wishlist' }}
                </button>
              } @else {
                <a mat-raised-button color="primary" routerLink="/auth/login">Login to Purchase</a>
              }
            </div>
          </div>
        </div>

        @if (reviews().length > 0) {
          <section class="reviews-section">
            <h2>Customer Reviews</h2>
            <div class="reviews-list">
              @for (review of reviews(); track review._id) {
                <div class="review-card">
                  <div class="review-header">
                    <div class="reviewer">
                      <mat-icon>account_circle</mat-icon>
                      <span>{{ review.user?.name }}</span>
                    </div>
                    <div class="rating">
                      @for (star of [1,2,3,4,5]; track star) {
                        <mat-icon>{{ star <= review.rating ? 'star' : 'star_border' }}</mat-icon>
                      }
                    </div>
                  </div>
                  @if (review.comment) {
                    <p class="comment">{{ review.comment }}</p>
                  }
                  <span class="date">{{ review.createdAt | date }}</span>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .product-detail {
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
        font-size: 0.875rem;

        a {
          color: #3f51b5;
          text-decoration: none;

          &:hover { text-decoration: underline; }
        }

        mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
      }

      .product-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .product-images {
        .main-image {
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .placeholder {
            color: #ccc;
            text-align: center;

            mat-icon {
              font-size: 4rem;
              width: 4rem;
              height: 4rem;
            }
          }
        }

        .thumbnail-list {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          overflow-x: auto;

          .thumbnail {
            width: 80px;
            height: 80px;
            padding: 0;
            border: 2px solid transparent;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            background: none;

            &.active { border-color: #3f51b5; }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .product-info {
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          color: #666;

          > span {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            mat-icon {
              font-size: 1rem;
              width: 1rem;
              height: 1rem;
            }
          }

          .rating mat-icon { color: #ff9800; }
        }

        .price-section {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 1.5rem;

          .price {
            font-size: 2.5rem;
            font-weight: 700;
            color: #3f51b5;
          }

          .file-type {
            font-size: 0.875rem;
            color: #666;
          }
        }

        .description {
          color: #444;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .specs {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;

          h3 {
            font-size: 0.875rem;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 0.5rem;
          }

          ul {
            margin: 0;
            padding-left: 1.25rem;
          }
        }

        .actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
      }

      .reviews-section {
        border-top: 1px solid #e0e0e0;
        padding-top: 2rem;

        h2 { margin-bottom: 1.5rem; }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);

          .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;

            .reviewer {
              display: flex;
              align-items: center;
              gap: 0.5rem;

              mat-icon { color: #666; }
            }

            .rating {
              display: flex;

              mat-icon {
                font-size: 1rem;
                width: 1rem;
                height: 1rem;
                color: #ff9800;
              }
            }
          }

          .comment {
            margin-bottom: 0.5rem;
            color: #333;
          }

          .date {
            font-size: 0.75rem;
            color: #999;
          }
        }
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  reviews = signal<any[]>([]);
  loading = signal(true);
  selectedImage = signal<string>('');
  wishlistProductIds = signal<string[]>([]);

  isAuthenticated = () => this.authService.isAuthenticated();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
    if (this.isAuthenticated()) {
      this.loadWishlist();
    }
  }

  loadProduct(id: string): void {
    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.product.set(response.product);
        this.reviews.set(response.reviews);
        if (response.product.previewImages?.length) {
          this.selectedImage.set(response.product.previewImages[0]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load product', 'Close', { duration: 3000 });
        this.router.navigate(['/marketplace']);
      }
    });
  }

  loadWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        const ids = res.wishlist.products?.map((p: any) => p._id) || [];
        this.wishlistProductIds.set(ids);
      },
      error: () => {}
    });
  }

  selectImage(img: string): void {
    this.selectedImage.set(img);
  }

  isInWishlist(): boolean {
    const product = this.product();
    return product ? this.wishlistProductIds().includes(product._id) : false;
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    this.cartService.addToCart(product._id).subscribe({
      next: () => {
        this.snackBar.open('Added to cart', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to add to cart', 'Close', { duration: 3000 });
      }
    });
  }

  toggleWishlist(): void {
    const product = this.product();
    if (!product) return;

    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(product._id).subscribe({
        next: () => {
          this.wishlistProductIds.set(this.wishlistProductIds().filter(id => id !== product._id));
          this.snackBar.open('Removed from wishlist', 'Close', { duration: 2000 });
        }
      });
    } else {
      this.wishlistService.addToWishlist(product._id).subscribe({
        next: () => {
          this.wishlistProductIds.set([...this.wishlistProductIds(), product._id]);
          this.snackBar.open('Added to wishlist', 'Close', { duration: 2000 });
        }
      });
    }
  }
}