import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

export interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  rating: number;
  category?: string;
  seller?: string;
}

export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  searchQuery?: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Input() categories: string[] = [];
  @Input() emptyMessage = 'No products found';
  @Input() showFilters = true;
  @Input() showSearch = true;

  @Output() filterChange = new EventEmitter<FilterOptions>();
  @Output() productClick = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<Product>();

  searchQuery = '';
  selectedCategory = '';
  priceRange = { min: 0, max: 1000 };
  maxPriceLimit = 1000;

  onSearch(): void {
    this.emitFilters();
  }

  onCategoryChange(): void {
    this.emitFilters();
  }

  onPriceChange(): void {
    this.emitFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.priceRange = { min: 0, max: this.maxPriceLimit };
    this.emitFilters();
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  formatRating(rating: number): string {
    return rating ? rating.toFixed(1) : '0.0';
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  onProductClick(product: Product): void {
    this.productClick.emit(product);
  }

  onViewDetails(product: Product, event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(product);
  }

  private emitFilters(): void {
    this.filterChange.emit({
      searchQuery: this.searchQuery || undefined,
      category: this.selectedCategory || undefined,
      minPrice: this.priceRange.min || undefined,
      maxPrice: this.priceRange.max < this.maxPriceLimit ? this.priceRange.max : undefined
    });
  }
}