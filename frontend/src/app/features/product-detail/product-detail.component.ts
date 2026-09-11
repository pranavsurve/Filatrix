import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
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
    MatSnackBarModule,
    AssetUrlPipe
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  reviews = signal<any[]>([]);
  loading = signal(true);
  selectedImage = signal<string>('');
  wishlistProductIds = signal<string[]>([]);
  wishlistAnimating = signal(false);
  cartAnimating = signal(false);

  isAuthenticated = () => this.authService.isAuthenticated();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private notification: NotificationService
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
        this.notification.error('Failed to load product');
        this.router.navigate(['/products']);
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
        this.cartAnimating.set(true);
        setTimeout(() => this.cartAnimating.set(false), 500);
        this.notification.cartAdded(product.title);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to add to cart');
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
          this.wishlistService.updateWishlistCount(this.wishlistProductIds().length);
          this.notification.wishlistRemoved(product.title);
        },
        error: (err) => this.notification.error(err.error?.message || 'Failed to update wishlist')
      });
    } else {
      this.wishlistAnimating.set(true);
      setTimeout(() => this.wishlistAnimating.set(false), 650);
      this.wishlistService.addToWishlist(product._id).subscribe({
        next: () => {
          this.wishlistProductIds.set([...this.wishlistProductIds(), product._id]);
          this.wishlistService.updateWishlistCount(this.wishlistProductIds().length);
          this.notification.wishlistAdded(product.title);
        },
        error: (err) => this.notification.error(err.error?.message || 'Failed to add to wishlist')
      });
    }
  }
}