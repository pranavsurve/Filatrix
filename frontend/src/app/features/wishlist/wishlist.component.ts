import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
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