/**
 * USAGE EXAMPLE
 *
 * In your parent component or template:
 */

// Parent Component (.ts)
import { Component } from '@angular/core';
import { ProductUploadComponent, ProductUploadData } from './product-upload.component';

@Component({
  selector: 'app-seller-upload',
  template: `
    <app-product-upload
      [categories]="categoryList"
      [isSubmitting]="isUploading"
      submitLabel="Publish Product"
      (formSubmit)="onProductSubmit($event)"
      (cancel)="onCancel()">
    </app-product-upload>
  `
})
export class SellerUploadComponent {
  isUploading = false;
  categoryList = ['Art', 'Toys', 'Home', 'Tools', 'Jewelry', 'Other'];

  onProductSubmit(data: ProductUploadData): void {
    console.log('Product data:', {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      tags: data.tags,
      images: data.images.map(f => f.name),
      modelFile: data.modelFile.name,
      dimensions: data.dimensions,
      printSettings: data.printSettings
    });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category', data.category);
    formData.append('tags', data.tags.join(','));

    data.images.forEach((file, index) => {
      formData.append('images', file);
    });

    formData.append('modelFile', data.modelFile);

    // Send to your API
    // this.productService.createProduct(formData).subscribe(...);
  }

  onCancel(): void {
    console.log('Form cancelled');
  }
}


// Alternative: With HttpClient file upload
/*
import { HttpClient } from '@angular/common/http';

onProductSubmit(data: ProductUploadData): void {
  this.isUploading = true;

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('category', data.category);
  formData.append('tags', data.tags.join(','));

  data.images.forEach((file, index) => {
    formData.append('images', file);
  });

  formData.append('modelFile', data.modelFile);

  this.http.post('/api/products', formData).subscribe({
    next: (response) => {
      console.log('Upload success:', response);
      this.isUploading = false;
    },
    error: (error) => {
      console.error('Upload failed:', error);
      this.isUploading = false;
    }
  });
}
*/