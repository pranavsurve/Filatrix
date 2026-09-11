import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';
import { NotificationService } from './core/services/notification.service';
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
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="app-container">
      <nav class="app-nav">
        <div class="nav-inner">
          <a routerLink="/" class="logo group" aria-label="FilatrixStudio home">
            <img src="assets/images/filatrix-logo.jpg" alt="FilatrixStudio" class="logo-image logo-glow">
          </a>

          <div class="nav-links">
            <a routerLink="/products" routerLinkActive="active" class="nav-link">Products</a>
            @if (isAuthenticated()) {
              <a routerLink="/wishlist" routerLinkActive="active" class="nav-link nav-link-icon" aria-label="Wishlist" [class.nav-heart-pop]="navHeartAnimating">
                <mat-icon [matBadge]="wishlistCount" [matBadgeHidden]="wishlistCount === 0" matBadgeColor="accent">favorite</mat-icon>
              </a>
            }
          </div>

          <div class="nav-actions">
            @if (isAuthenticated()) {
              <a routerLink="/cart" class="nav-link-icon" aria-label="Cart">
                <mat-icon [matBadge]="cartCount" [matBadgeHidden]="cartCount === 0" matBadgeColor="primary">shopping_cart</mat-icon>
              </a>

              <button
                type="button"
                class="user-menu-trigger"
                #userMenuTrigger="matMenuTrigger"
                [matMenuTriggerFor]="userMenu"
                [class.is-open]="userMenuTrigger.menuOpen">
                <span class="user-avatar">{{ currentUser()?.name?.[0]?.toUpperCase() || 'U' }}</span>
                <span class="user-name">{{ currentUser()?.name }}</span>
                <mat-icon class="chevron" [class.rotated]="userMenuTrigger.menuOpen">expand_more</mat-icon>
              </button>

              <mat-menu
                #userMenu="matMenu"
                class="filatrix-user-menu"
                xPosition="before"
                yPosition="below"
                [overlapTrigger]="false">
                <ng-template matMenuContent>
                  @if (currentUser(); as user) {
                    <div class="user-menu-header">
                      <div class="user-menu-avatar">{{ user.name?.[0]?.toUpperCase() || 'U' }}</div>
                      <div>
                        <p class="user-menu-name">{{ user.name }}</p>
                        <p class="user-menu-email">{{ user.email }}</p>
                      </div>
                    </div>
                    <mat-divider></mat-divider>
                  }
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
                  <button mat-menu-item class="logout-item" (click)="logout()">
                    <mat-icon>logout</mat-icon>
                    Logout
                  </button>
                </ng-template>
              </mat-menu>
            } @else {
              <a routerLink="/auth/login" class="nav-btn nav-btn-ghost">Login</a>
              <a routerLink="/auth/register" class="nav-btn nav-btn-primary">Sign Up</a>
            }
          </div>
        </div>
        <div class="nav-accent-line"></div>
      </nav>

      <main class="main-content page-enter">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <div class="footer-inner">
          <img src="assets/images/filatrix-logo.jpg" alt="FilatrixStudio" class="footer-logo">
          <p class="text-sm text-slate-500">&copy; 2026 FilatrixStudio — Premium 3D Printed Products</p>
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

    .app-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--filatrix-surface);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 0.75rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;

      @media (max-width: 768px) {
        padding: 0.75rem 1rem;
        gap: 0.75rem;
      }
    }

    .nav-accent-line {
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--filatrix-accent), var(--filatrix-accent-mid), var(--filatrix-accent-deep), transparent);
      opacity: 0.65;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
      transition: transform 0.25s ease;

      &:hover {
        transform: translateY(-1px) scale(1.02);
      }
    }

    .logo-image {
      height: 44px;
      width: auto;
      object-fit: contain;
      border-radius: 8px;

      @media (max-width: 640px) {
        height: 38px;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .nav-link {
      position: relative;
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      transition: color 0.2s ease, background-color 0.2s ease;

      &::after {
        content: '';
        position: absolute;
        left: 1rem;
        right: 1rem;
        bottom: 0.35rem;
        height: 2px;
        border-radius: 999px;
        background: var(--filatrix-gradient);
        transform: scaleX(0);
        transition: transform 0.25s ease;
      }

      &:hover {
        color: #e2e8f0;
        background: rgba(255, 255, 255, 0.05);
      }

      &.active {
        color: #e2e8f0;
        background: rgba(34, 211, 238, 0.08);

        &::after {
          transform: scaleX(1);
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-left: auto;
      flex-shrink: 0;
      position: relative;
    }

    .nav-link-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 10px;
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

      &:hover {
        color: var(--filatrix-accent);
        background: rgba(34, 211, 238, 0.08);
        transform: translateY(-1px);
      }

      mat-icon {
        color: inherit;
      }
    }

    .user-menu-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem 0.35rem 0.35rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      cursor: pointer;
      transition: border-color 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;

      &:hover,
      &.is-open {
        border-color: rgba(34, 211, 238, 0.45);
        background: rgba(34, 211, 238, 0.08);
        box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
      }
    }

    .user-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      background: var(--filatrix-gradient);
    }

    .user-name {
      display: none;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
      color: #cbd5e1;

      @media (min-width: 640px) {
        display: inline;
      }
    }

    .chevron {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: #94a3b8;
      transition: transform 0.22s ease, color 0.22s ease;

      &.rotated {
        transform: rotate(180deg);
        color: var(--filatrix-accent);
      }
    }

    .nav-btn {
      text-decoration: none;
      border-radius: 10px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.22s ease;
    }

    .nav-btn-ghost {
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);

      &:hover {
        color: #fff;
        border-color: rgba(34, 211, 238, 0.35);
        background: rgba(34, 211, 238, 0.08);
      }
    }

    .nav-btn-primary {
      color: #fff;
      background: var(--filatrix-gradient);
      box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 22px rgba(129, 140, 248, 0.35);
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .app-footer {
      margin-top: 3rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(11, 17, 32, 0.85);
    }

    .footer-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1rem;
      text-align: center;
    }

    .footer-logo {
      height: 56px;
      width: auto;
      object-fit: contain;
      opacity: 0.9;
    }
  `]
})
export class AppComponent {
  cartCount = 0;
  wishlistCount = 0;
  navHeartAnimating = false;
  private subscriptions: Subscription[] = [];

  currentUser = this.authService.currentUser;
  isAuthenticated = () => this.authService.isAuthenticated();
  isSeller = () => this.authService.isSeller();
  isAdmin = () => this.authService.isAdmin();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notification: NotificationService
  ) {
    if (this.isAuthenticated()) {
      this.loadCounts();
    }

    this.subscriptions.push(
      this.notification.wishlistPulse$.subscribe(() => {
        this.navHeartAnimating = true;
        setTimeout(() => this.navHeartAnimating = false, 650);
      })
    );
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
    this.notification.success('Logged out successfully');
  }
}