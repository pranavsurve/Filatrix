import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
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