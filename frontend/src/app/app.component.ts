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
      <!-- Glassmorphism Navbar -->
      <nav class="glass sticky top-0 z-50 transition-all duration-300">
        <a routerLink="/" class="logo group">
          <mat-icon class="text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">view_in_ar</mat-icon>
          <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl">Filatrix</span>
        </a>

        <div class="nav-links">
          <a routerLink="/products" routerLinkActive="active" class="nav-link">
            <span class="relative z-10">Products</span>
          </a>
          <a routerLink="/wishlist" routerLinkActive="active" *ngIf="isAuthenticated()" class="nav-link">
            <mat-icon [matBadge]="wishlistCount" [matBadgeHidden]="wishlistCount === 0" matBadgeColor="accent" class="text-pink-400">favorite</mat-icon>
          </a>
        </div>

        <div class="nav-actions">
          @if (isAuthenticated()) {
            <a routerLink="/cart" class="nav-link-icon relative">
              <mat-icon [matBadge]="cartCount" [matBadgeHidden]="cartCount === 0" matBadgeColor="primary" class="text-slate-300">shopping_cart</mat-icon>
            </a>

            <button class="glass-btn flex items-center gap-2 text-sm" [matMenuTriggerFor]="userMenu">
              <span class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
                {{ currentUser()?.name?.[0]?.toUpperCase() || 'U' }}
              </span>
              <span class="hidden sm:inline text-slate-300">{{ currentUser()?.name }}</span>
              <mat-icon class="text-xs text-slate-400">expand_more</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="after">
              <a routerLink="/profile" mat-menu-item class="!text-slate-200">
                <mat-icon class="text-indigo-400">person</mat-icon>
                Profile
              </a>
              @if (isSeller()) {
                <a routerLink="/seller/dashboard" mat-menu-item class="!text-slate-200">
                  <mat-icon class="text-indigo-400">store</mat-icon>
                  Seller Dashboard
                </a>
              }
              @if (isAdmin()) {
                <a routerLink="/admin/dashboard" mat-menu-item class="!text-slate-200">
                  <mat-icon class="text-indigo-400">admin_panel_settings</mat-icon>
                  Admin Panel
                </a>
              }
              <a routerLink="/orders" mat-menu-item class="!text-slate-200">
                <mat-icon class="text-indigo-400">receipt_long</mat-icon>
                My Orders
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="!text-pink-400">
                <mat-icon class="text-pink-400">logout</mat-icon>
                Logout
              </button>
            </mat-menu>
          } @else {
            <a routerLink="/auth/login" class="glass-btn text-sm text-slate-300 hover:text-white">Login</a>
            <a routerLink="/auth/register" class="relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
              Sign Up
            </a>
          }
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="glass border-t border-white/5 mt-12">
        <div class="container py-6 text-center">
          <p class="text-sm text-slate-500">&copy; 2026 Filatrix — Premium 3D Printed Products</p>
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

    .glass {
      background: rgba(15, 23, 42, 0.75) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;

      @media (max-width: 768px) {
        padding: 0.75rem 1rem;
        gap: 1rem;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 700;

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
        color: #94a3b8;
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.06);
        }

        &.active {
          color: #818cf8;
          background: rgba(99, 102, 241, 0.1);
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-link-icon {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
      color: #94a3b8;

      &:hover {
        color: #e2e8f0;
        background: rgba(255, 255, 255, 0.06);
      }
    }

    .glass-btn {
      background: rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 10px !important;
      padding: 0.5rem 1rem;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(99, 102, 241, 0.3) !important;
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
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
          this.wishlistService.updateWishlistCount(this.wishlistCount);
        },
        error: () => {}
      }),
      this.wishlistService.wishlistCount$.subscribe(count => {
        this.wishlistCount = count;
      })
    );
  }

  logout(): void {
    this.authService.logout();
  }
}