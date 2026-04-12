import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <a routerLink="/" class="logo">
          <mat-icon>view_in_ar</mat-icon>
          Filatrix
        </a>

        <div class="nav-links">
          <a routerLink="/marketplace" routerLinkActive="active">Marketplace</a>
          <a routerLink="/wishlist" routerLinkActive="active" *ngIf="isAuthenticated()">
            <mat-icon [matBadge]="wishlistCount" [matBadgeHidden]="wishlistCount === 0" matBadgeColor="accent">favorite</mat-icon>
          </a>
        </div>

        <div class="nav-actions">
          @if (isAuthenticated()) {
            <a routerLink="/cart" mat-icon-button>
              <mat-icon [matBadge]="cartCount" [matBadgeHidden]="cartCount === 0" matBadgeColor="primary">shopping_cart</mat-icon>
            </a>

            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{ currentUser()?.name }}
            </button>
            <mat-menu #userMenu="matMenu">
              <a routerLink="/profile" mat-menu-item>
                <mat-icon>person</mat-icon>
                Profile
              </a>
              @if (isSeller()) {
                <a routerLink="/seller/dashboard" mat-menu-item>
                  <mat-icon>store</mat-icon>
                  Seller Dashboard
                </a>
              }
              @if (isAdmin()) {
                <a routerLink="/admin/dashboard" mat-menu-item>
                  <mat-icon>admin_panel_settings</mat-icon>
                  Admin Panel
                </a>
              }
              <a routerLink="/orders" mat-menu-item>
                <mat-icon>receipt_long</mat-icon>
                My Orders
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Logout
              </button>
            </mat-menu>
          } @else {
            <a routerLink="/auth/login" mat-button>Login</a>
            <a routerLink="/auth/register" mat-raised-button color="primary">Sign Up</a>
          }
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 Filatrix - 3D Print Marketplace</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .navbar {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 0.75rem 2rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;

      .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.5rem;
        font-weight: 700;
        color: #3f51b5;
        text-decoration: none;

        mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
        }
      }

      .nav-links {
        display: flex;
        gap: 1.5rem;
        flex: 1;

        a {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.2s;

          &:hover, &.active {
            background: rgba(63, 81, 181, 0.1);
            color: #3f51b5;
          }
        }
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .footer {
      background: #f5f5f5;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #666;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem 1rem;
        gap: 1rem;
      }
    }
  `]
})
export class AppComponent {
  cartCount = 0;
  wishlistCount = 0;
  private subscriptions: Subscription[] = [];

  currentUser = this.authService.currentUser;
  isAuthenticated = () => this.authService.isAuthenticated();
  isSeller = () => this.authService.isSeller();
  isAdmin = () => this.authService.isAdmin();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {
    if (this.isAuthenticated()) {
      this.loadCounts();
    }
  }

  private loadCounts(): void {
    this.subscriptions.push(
      this.cartService.getCart().subscribe({
        next: (res) => {
          this.cartCount = res.cart.items.length;
        },
        error: () => {}
      }),
      this.wishlistService.getWishlist().subscribe({
        next: (res) => {
          this.wishlistCount = res.wishlist.products?.length || 0;
        },
        error: () => {}
      })
    );
  }

  logout(): void {
    this.authService.logout();
  }
}