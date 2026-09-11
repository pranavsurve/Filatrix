import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-marketplace',
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
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    AssetUrlPipe
  ],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  pagination = signal({ page: 1, limit: 12, total: 0, pages: 0 });
  wishlistProductIds = signal<string[]>([]);
  heartAnimatingIds = signal<string[]>([]);
  cartAnimatingIds = signal<string[]>([]);

  searchQuery = '';
  selectedCategory = '';
  sortBy = '';

  private page = 1;

  constructor(
    private productService: ProductService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private notification: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadWishlistIds();
    }

    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.searchQuery = params['search'] || '';
      this.page = 1;
      this.loadProducts();
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.updateQueryParams();
    this.loadProducts();
  }

  onSearch(): void {
    this.page = 1;
    this.updateQueryParams();
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pagination.update(p => ({ ...p, limit: event.pageSize }));
    this.loadProducts();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistProductIds().includes(productId);
  }

  isHeartAnimating(productId: string): boolean {
    return this.heartAnimatingIds().includes(productId);
  }

  isCartAnimating(productId: string): boolean {
    return this.cartAnimatingIds().includes(productId);
  }

  onToggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.isInWishlist(product._id)) {
      this.wishlistService.removeFromWishlist(product._id).subscribe({
        next: () => {
          this.wishlistProductIds.set(this.wishlistProductIds().filter(id => id !== product._id));
          this.wishlistService.updateWishlistCount(this.wishlistProductIds().length);
          this.notification.wishlistRemoved(product.title);
        },
        error: (err) => this.notification.error(err.error?.message || 'Failed to update wishlist')
      });
      return;
    }

    this.triggerHeartAnimation(product._id);
    this.wishlistService.addToWishlist(product._id).subscribe({
      next: () => {
        this.wishlistProductIds.set([...this.wishlistProductIds(), product._id]);
        this.wishlistService.updateWishlistCount(this.wishlistProductIds().length);
        this.notification.wishlistAdded(product.title);
      },
      error: (err) => this.notification.error(err.error?.message || 'Failed to add to wishlist')
    });
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.triggerCartAnimation(product._id);
    this.cartService.addToCart(product._id, 1).subscribe({
      next: () => this.notification.cartAdded(product.title),
      error: (err) => this.notification.error(err.error?.message || 'Failed to add to cart')
    });
  }

  private loadWishlistIds(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        const ids = res.wishlist.products?.map((p: Product) => p._id) || [];
        this.wishlistProductIds.set(ids);
        this.wishlistService.updateWishlistCount(ids.length);
      },
      error: () => {}
    });
  }

  private triggerHeartAnimation(productId: string): void {
    this.heartAnimatingIds.set([...this.heartAnimatingIds(), productId]);
    setTimeout(() => {
      this.heartAnimatingIds.set(this.heartAnimatingIds().filter(id => id !== productId));
    }, 650);
  }

  private triggerCartAnimation(productId: string): void {
    this.cartAnimatingIds.set([...this.cartAnimatingIds(), productId]);
    setTimeout(() => {
      this.cartAnimatingIds.set(this.cartAnimatingIds().filter(id => id !== productId));
    }, 500);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({
      page: this.page,
      limit: this.pagination().limit,
      category: this.selectedCategory || undefined,
      search: this.searchQuery || undefined,
      sortBy: this.sortBy || undefined
    }).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory || null,
        search: this.searchQuery || null
      },
      queryParamsHandling: 'merge'
    });
  }
}