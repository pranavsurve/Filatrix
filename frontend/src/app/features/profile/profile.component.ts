import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSnackBarModule],
  template: `
    <div class="profile-container container">
      <h1>My Profile</h1>

      <mat-card class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            @if (user()?.avatar) {
              <img [src]="user()!.avatar" [alt]="user()!.name">
            } @else {
              <mat-icon>account_circle</mat-icon>
            }
          </div>
          <div class="info">
            <h2>{{ user()?.name }}</h2>
            <p>{{ user()?.email }}</p>
            <span class="role">{{ user()?.role | titlecase }}</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="edit-form">
        <h3>Edit Profile</h3>
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="name" name="name" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Avatar URL</mat-label>
            <input matInput [(ngModel)]="avatar" name="avatar">
          </mat-form-field>

          @if (success()) {
            <p class="success-message">Profile updated successfully!</p>
          }

          <button mat-raised-button color="primary" type="submit">Save Changes</button>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      h1 { margin-bottom: 2rem; }

      .profile-card {
        padding: 2rem;
        margin-bottom: 2rem;

        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;

          .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;

            img { width: 100%; height: 100%; object-fit: cover; }
            mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
          }

          h2 { margin-bottom: 0.25rem; }
          p { color: #666; margin-bottom: 0.5rem; }
          .role {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #e8e8e8;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
          }
        }
      }

      .edit-form {
        padding: 2rem;

        h3 { margin-bottom: 1.5rem; }

        .full-width { width: 100%; margin-bottom: 1rem; }

        .success-message {
          color: #4caf50;
          margin-bottom: 1rem;
        }
      }
    }
  `]
})
export class ProfileComponent {
  user = this.authService.currentUser;
  name = this.user()?.name || '';
  avatar = this.user()?.avatar || '';
  success = signal(false);

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    this.authService.updateProfile({ name: this.name, avatar: this.avatar }).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.success.set(false), 3000);
      },
      error: () => this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 })
    });
  }
}