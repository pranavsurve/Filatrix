import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  isEdit = signal(false);
  product: any = {
    title: '',
    description: '',
    price: 0,
    category: 'other',
    fileType: 'stl'
  };
  tagsInput = '';
  dimensions = { width: 0, height: 0, depth: 0 };
  saving = signal(false);
  success = signal(false);

  private productId = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.isEdit.set(true);
      this.loadProduct();
    }
  }

  loadProduct(): void {
    this.productService.getProduct(this.productId).subscribe({
      next: (res) => {
        this.product = {
          title: res.product.title,
          description: res.product.description,
          price: res.product.price,
          category: res.product.category,
          fileType: res.product.fileType || 'stl'
        };
        this.tagsInput = res.product.tags?.join(', ') || '';
        this.dimensions = res.product.dimensions || { width: 0, height: 0, depth: 0 };
      }
    });
  }

  onSubmit(): void {
    const productData: any = {
      ...this.product,
      tags: this.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      dimensions: this.dimensions
    };

    const request = this.isEdit()
      ? this.productService.updateProduct(this.productId, productData)
      : this.productService.createProduct(productData);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        this.notification.success(
          this.isEdit() ? 'Product updated successfully' : 'Product added successfully'
        );
        setTimeout(() => {
          this.router.navigate(['/seller/products']);
        }, 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message || 'Failed to save product');
      }
    });
  }
}