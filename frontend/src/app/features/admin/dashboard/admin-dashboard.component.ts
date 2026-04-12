import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="admin-dashboard container">
      <h1>Admin Dashboard</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon>people</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalUsers || 0 }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon>inventory_2</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalProducts || 0 }}</span>
              <span class="stat-label">Total Products</span>
            </div>
          </mat-card>

          <mat-card class="stat-card pending">
            <mat-icon>pending</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.pendingProducts || 0 }}</span>
              <span class="stat-label">Pending Approval</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon>shopping_cart</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalOrders || 0 }}</span>
              <span class="stat-label">Total Orders</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon>attach_money</mat-icon>
            <div class="stat-info">
              <span class="stat-value">\${{ (stats()?.totalRevenue || 0).toFixed(2) }}</span>
              <span class="stat-label">Total Revenue</span>
            </div>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      h1 { margin-bottom: 2rem; }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
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

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .stat-label {
          color: #666;
          font-size: 0.875rem;
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<any>(null);
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAdminStats().subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}