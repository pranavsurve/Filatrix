import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="product-form container">
      <h1>{{ isEdit() ? 'Edit Product' : 'Add New Product' }}</h1>

      <mat-card>
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="product.title" name="title" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="product.description" name="description" rows="4" required></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Price</mat-label>
              <input matInput type="number" [(ngModel)]="product.price" name="price" required min="0">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="product.category" name="category" required>
                <mat-option value="art">Art & Sculpture</mat-option>
                <mat-option value="toys">Toys & Games</mat-option>
                <mat-option value="home">Home & Decor</mat-option>
                <mat-option value="tools">Tools & Parts</mat-option>
                <mat-option value="jewelry">Jewelry</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tags (comma separated)</mat-label>
              <input matInput [(ngModel)]="tagsInput" name="tags">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>File Type</mat-label>
              <mat-select [(ngModel)]="product.fileType" name="fileType">
                <mat-option value="stl">STL</mat-option>
                <mat-option value="obj">OBJ</mat-option>
                <mat-option value="both">Both</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="dimensions">
            <h3>Dimensions (mm)</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Width</mat-label>
                <input matInput type="number" [(ngModel)]="dimensions.width" name="width">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Height</mat-label>
                <input matInput type="number" [(ngModel)]="dimensions.height" name="height">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Depth</mat-label>
                <input matInput type="number" [(ngModel)]="dimensions.depth" name="depth">
              </mat-form-field>
            </div>
          </div>

          @if (success()) {
            <p class="success-message">Product saved successfully!</p>
          }

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Product' }}
            </button>
            <a mat-button routerLink="/seller/products">Cancel</a>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .product-form {
      max-width: 800px;

      h1 { margin-bottom: 2rem; }

      mat-card { padding: 2rem; }

      .full-width { width: 100%; margin-bottom: 1rem; }

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .dimensions {
        margin-bottom: 1.5rem;

        h3 { margin-bottom: 1rem; font-size: 1rem; }
      }

      .success-message {
        color: #4caf50;
        margin-bottom: 1rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }
    }
  `]
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
    private snackBar: MatSnackBar
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
        setTimeout(() => {
          this.router.navigate(['/seller/products']);
        }, 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save product', 'Close', { duration: 3000 });
      }
    });
  }
}