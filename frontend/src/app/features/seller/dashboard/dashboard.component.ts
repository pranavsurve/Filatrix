import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="dashboard-container container">
      <h1>Seller Dashboard</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon>inventory_2</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalProducts || 0 }}</span>
              <span class="stat-label">Total Products</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon>check_circle</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.approvedProducts || 0 }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </mat-card>

          <mat-card class="stat-card pending">
            <mat-icon>hourglass_empty</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.pendingProducts || 0 }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon>attach_money</mat-icon>
            <div class="stat-info">
              <span class="stat-value">\${{ (stats()?.totalEarnings || 0).toFixed(2) }}</span>
              <span class="stat-label">Total Earnings</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon>shopping_bag</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalSales || 0 }}</span>
              <span class="stat-label">Total Sales</span>
            </div>
          </mat-card>
        </div>

        <div class="actions">
          <a mat-raised-button color="primary" routerLink="/seller/products/new">
            <mat-icon>add</mat-icon>
            Add New Product
          </a>
          <a mat-stroked-button routerLink="/seller/products">
            <mat-icon>list</mat-icon>
            Manage Products
          </a>
          <a mat-stroked-button routerLink="/seller/orders">
            <mat-icon>receipt</mat-icon>
            View Orders
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      h1 { margin-bottom: 2rem; }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;

        mat-icon {
          font-size: 2.5rem;
          width: 2.5rem;
          height: 2.5rem;
          color: #3f51b5;
        }

        &.pending mat-icon { color: #ff9800; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .stat-label {
          color: #666;
          font-size: 0.875rem;
        }
      }

      .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<any>(null);
  loading = signal(true);

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}