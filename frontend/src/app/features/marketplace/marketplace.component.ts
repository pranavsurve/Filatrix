import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  pagination = signal({ page: 1, limit: 12, total: 0, pages: 0 });

  searchQuery = '';
  selectedCategory = '';
  sortBy = '';

  private page = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.searchQuery = params['search'] || '';
      this.page = 1;
      this.loadProducts();
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.updateQueryParams();
    this.loadProducts();
  }

  onSearch(): void {
    this.page = 1;
    this.updateQueryParams();
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pagination.update(p => ({ ...p, limit: event.pageSize }));
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({
      page: this.page,
      limit: this.pagination().limit,
      category: this.selectedCategory || undefined,
      search: this.searchQuery || undefined,
      sortBy: this.sortBy || undefined
    }).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory || null,
        search: this.searchQuery || null
      },
      queryParamsHandling: 'merge'
    });
  }
}