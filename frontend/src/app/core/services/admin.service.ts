import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<{ stats: any }> {
    return this.http.get<{ stats: any }>(`${constService.API_URL}/admin/stats`);
  }

  getAllProducts(): Observable<{ products: any[] }> {
    return this.http.get<{ products: any[] }>(`${constService.API_URL}/admin/products`);
  }

  updateProductStatus(productId: string, status: string): Observable<{ product: any }> {
    return this.http.put<{ product: any }>(
      `${constService.API_URL}/admin/products/${productId}/status`,
      { status }
    );
  }

  getAllUsers(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${constService.API_URL}/admin/users`);
  }

  updateUserRole(userId: string, role: string): Observable<{ user: any }> {
    return this.http.put<{ user: any }>(
      `${constService.API_URL}/admin/users/${userId}/role`,
      { role }
    );
  }

  toggleUserStatus(userId: string): Observable<{ user: any }> {
    return this.http.put<{ user: any }>(
      `${constService.API_URL}/admin/users/${userId}/toggle`,
      {}
    );
  }
}