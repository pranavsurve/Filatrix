import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getAllProducts().subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approveProduct(id: string): void {
    this.adminService.updateProductStatus(id, 'approved').subscribe({
      next: () => {
        this.updateProductStatus(id, 'approved');
        this.snackBar.open('Product approved', 'Close', { duration: 2000 });
      }
    });
  }

  rejectProduct(id: string): void {
    this.adminService.updateProductStatus(id, 'rejected').subscribe({
      next: () => {
        this.updateProductStatus(id, 'rejected');
        this.snackBar.open('Product rejected', 'Close', { duration: 2000 });
      }
    });
  }

  private updateProductStatus(id: string, status: 'pending' | 'approved' | 'rejected'): void {
    this.products.update(list =>
      list.map(p => p._id === id ? { ...p, status } : p)
    );
  }
}