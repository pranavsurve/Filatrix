import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';
import { Product } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    seller?: string;
  }): Observable<{ products: Product[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ products: Product[]; pagination: any }>(
      `${constService.API_URL}/products`,
      { params: httpParams }
    );
  }

  getProduct(id: string): Observable<{ product: Product; reviews: any[] }> {
    return this.http.get<{ product: Product; reviews: any[] }>(
      `${constService.API_URL}/products/${id}`
    );
  }

  getSellerProducts(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(
      `${constService.API_URL}/products/user/me`
    );
  }

  createProduct(product: any, images?: File[]): Observable<{ product: Product }> {
    if (images?.length) {
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
      images.forEach(image => formData.append('images', image));
      return this.http.post<{ product: Product }>(`${constService.API_URL}/products`, formData);
    }

    return this.http.post<{ product: Product }>(
      `${constService.API_URL}/products`,
      product
    );
  }

  updateProduct(id: string, product: any): Observable<{ product: Product }> {
    return this.http.put<{ product: Product }>(
      `${constService.API_URL}/products/${id}`,
      product
    );
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${constService.API_URL}/products/${id}`
    );
  }

  getCategories(): Observable<{ categories: any[] }> {
    return this.http.get<{ categories: any[] }>(
      `${constService.API_URL}/products/categories`
    );
  }

  uploadImages(id: string, images: File[]): Observable<{ product: Product }> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    return this.http.put<{ product: Product }>(
      `${constService.API_URL}/products/images/${id}`,
      formData
    );
  }
}