import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="admin-users container">
      <h1>Manage Users</h1>

      @if (loading()) {
        <div class="loading-spinner"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="users-list">
          @for (user of users(); track user._id) {
            <mat-card class="user-card">
              <div class="user-avatar">
                @if (user.avatar) {
                  <img [src]="user.avatar" [alt]="user.name">
                } @else {
                  <mat-icon>account_circle</mat-icon>
                }
              </div>
              <div class="user-info">
                <h3>{{ user.name }}</h3>
                <p>{{ user.email }}</p>
                <span class="role" [class]="'role-' + user.role">{{ user.role | titlecase }}</span>
              </div>
              <div class="user-actions">
                <select [(value)]="selectedRoles[user._id]" (change)="changeRole(user._id, $event)">
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
                <button mat-stroked-button (click)="toggleStatus(user._id)">
                  {{ user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-users {
      h1 { margin-bottom: 2rem; }

      .users-list { display: flex; flex-direction: column; gap: 1rem; }

      .user-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1rem;

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;

          img { width: 100%; height: 100%; object-fit: cover; }
          mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #ccc; }
        }

        .user-info {
          flex: 1;
          h3 { margin-bottom: 0.25rem; }
          p { color: #666; font-size: 0.875rem; margin-bottom: 0.5rem; }
          .role {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            &.role-buyer { background: #e3f2fd; color: #1565c0; }
            &.role-seller { background: #e8f5e9; color: #2e7d32; }
            &.role-admin { background: #f3e5f5; color: #7b1fa2; }
          }
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;

          select {
            padding: 0.5rem;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
        }
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  loading = signal(true);
  selectedRoles: Record<string, string> = {};

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users.set(res.users);
        res.users.forEach((u: any) => {
          this.selectedRoles[u._id] = u.role;
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  changeRole(userId: string, event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    this.adminService.updateUserRole(userId, role).subscribe({
      next: (res) => {
        this.users.update(list =>
          list.map(u => u._id === userId ? { ...u, role: res.user.role } : u)
        );
        this.snackBar.open('Role updated', 'Close', { duration: 2000 });
      }
    });
  }

  toggleStatus(userId: string): void {
    this.adminService.toggleUserStatus(userId).subscribe({
      next: (res) => {
        this.users.update(list =>
          list.map(u => u._id === userId ? { ...u, isActive: res.user.isActive } : u)
        );
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      }
    });
  }
}