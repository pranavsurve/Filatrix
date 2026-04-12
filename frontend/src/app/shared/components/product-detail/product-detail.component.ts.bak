import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isVerifiedPurchase?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  productCount?: number;
}

export interface ProductDetail {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category?: string;
  tags?: string[];
  seller: Seller;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  printSettings?: {
    layerHeight?: string;
    infill?: string;
    material?: string;
  };
  inStock?: boolean;
  fileTypes?: string[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  @Input() product!: ProductDetail;
  @Input() reviews: Review[] = [];
  @Input() loading = false;
  @Input() isAuthenticated = false;
  @Input() isInWishlist = false;
  @Input() isInCart = false;

  @Output() addToCart = new EventEmitter<ProductDetail>();
  @Output() toggleWishlist = new EventEmitter<ProductDetail>();
  @Output() submitReview = new EventEmitter<{ rating: number; comment: string }>();

  selectedImageIndex = 0;
  reviewRating = 0;
  reviewComment = '';

  constructor(private snackBar: MatSnackBar) {}

  get selectedImage(): string {
    if (this.product?.images?.length) {
      return this.product.images[this.selectedImageIndex];
    }
    return this.product?.imageUrl || '';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  getReviewStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyReviewStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  onAddToCart(): void {
    if (!this.isAuthenticated) {
      this.snackBar.open('Please login to add items to cart', 'Close', { duration: 3000 });
      return;
    }
    this.addToCart.emit(this.product);
  }

  onToggleWishlist(): void {
    if (!this.isAuthenticated) {
      this.snackBar.open('Please login to add items to wishlist', 'Close', { duration: 3000 });
      return;
    }
    this.toggleWishlist.emit(this.product);
  }

  onReviewRatingChange(rating: number): void {
    this.reviewRating = rating;
  }

  onSubmitReview(): void {
    if (this.reviewRating === 0) {
      this.snackBar.open('Please select a rating', 'Close', { duration: 2000 });
      return;
    }
    this.submitReview.emit({ rating: this.reviewRating, comment: this.reviewComment });
    this.reviewRating = 0;
    this.reviewComment = '';
  }

  formatDimension(value: number): string {
    return value ? `${value} mm` : '';
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.reviews.length;
  }
}