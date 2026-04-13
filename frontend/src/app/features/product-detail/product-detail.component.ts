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
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
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