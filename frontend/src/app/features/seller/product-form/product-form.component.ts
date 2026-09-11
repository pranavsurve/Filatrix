import { Component, signal, OnInit, OnDestroy } from '@angular/core';
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
import { resolveAssetUrl } from '../../../shared/utils/asset-url.util';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  isEdit = signal(false);
  product: any = {
    title: '',
    description: '',
    price: 0,
    category: 'other',
    fileType: 'stl'
  };
  tagsInput = '';
  imageUrl = '';
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  dimensions = { width: 0, height: 0, depth: 0 };
  saving = signal(false);
  success = signal(false);

  private productId = '';
  private previewUrls: string[] = [];

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

  ngOnDestroy(): void {
    this.revokePreviews();
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
        this.imageUrl = res.product.thumbnail?.startsWith('http') ? res.product.thumbnail : '';
        if (res.product.previewImages?.length) {
          this.imagePreviews = res.product.previewImages.map(img => resolveAssetUrl(img));
        }
      }
    });
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    this.revokePreviews();
    this.selectedImages = files.slice(0, 5);
    this.previewUrls = this.selectedImages.map(file => URL.createObjectURL(file));
    this.imagePreviews = [...this.previewUrls];
    input.value = '';
  }

  onSubmit(): void {
    const productData: any = {
      ...this.product,
      tags: this.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      dimensions: this.dimensions,
      imageUrl: this.imageUrl.trim()
    };

    this.saving.set(true);

    if (this.isEdit()) {
      const update$ = this.selectedImages.length
        ? this.productService.updateProduct(this.productId, productData).pipe(
            switchMap(() => this.productService.uploadImages(this.productId, this.selectedImages))
          )
        : this.productService.updateProduct(this.productId, productData);

      update$.subscribe({
        next: () => this.handleSuccess(true),
        error: (err) => this.handleError(err)
      });
      return;
    }

    this.productService.createProduct(productData, this.selectedImages).subscribe({
      next: () => this.handleSuccess(false),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(isEdit: boolean): void {
    this.saving.set(false);
    this.success.set(true);
    this.notification.success(isEdit ? 'Product updated successfully' : 'Product added successfully');
    setTimeout(() => this.router.navigate(['/seller/products']), 1200);
  }

  private handleError(err: any): void {
    this.saving.set(false);
    this.notification.error(err.error?.message || 'Failed to save product');
  }

  private revokePreviews(): void {
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
    this.previewUrls = [];
  }
}
