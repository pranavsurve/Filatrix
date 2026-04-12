/**
 * USAGE EXAMPLE
 *
 * In your parent component or template:
 */

// Parent Component (.ts)
import { Component } from '@angular/core';
import { ProductListComponent, Product, FilterOptions } from './product-list.component';

@Component({
  selector: 'app-catalog',
  template: `
    <app-product-list
      [products]="products"
      [loading]="isLoading"
      [categories]="categoryList"
      emptyMessage="No products available in this category"
      [showFilters]="true"
      [showSearch]="true"
      (filterChange)="onFilterChange($event)"
      (productClick)="onProductClick($event)"
      (viewDetails)="onViewDetails($event)">
    </app-product-list>
  `
})
export class CatalogComponent {
  products: Product[] = [];
  isLoading = false;
  categoryList = ['Electronics', 'Home', 'Toys', 'Art', 'Tools'];

  onFilterChange(filters: FilterOptions): void {
    console.log('Filters changed:', filters);
    // Apply filters to API call or local data
    this.fetchProducts(filters);
  }

  onProductClick(product: Product): void {
    console.log('Product clicked:', product);
  }

  onViewDetails(product: Product): void {
    console.log('View details:', product);
    // Navigate to product detail page
  }

  private fetchProducts(filters: FilterOptions): void {
    // Example API call with filters
  }
}


// Sample Product Data Structure
const sampleProducts: Product[] = [
  {
    id: '1',
    title: '3D Printed Robot Figure',
    price: 29.99,
    imageUrl: 'https://example.com/robot.jpg',
    rating: 4.5,
    category: 'Toys',
    seller: 'MakerLab'
  },
  {
    id: '2',
    title: 'Geometric Lamp Shade',
    price: 45.00,
    imageUrl: 'https://example.com/lamp.jpg',
    rating: 4.8,
    category: 'Home',
    seller: 'Design3D'
  }
];