import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';
import { Order } from '../../shared/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  createOrder(shippingAddress: any): Observable<{ order: Order }> {
    return this.http.post<{ order: Order }>(
      `${constService.API_URL}/orders`,
      { shippingAddress }
    );
  }

  getOrders(): Observable<{ orders: Order[] }> {
    return this.http.get<{ orders: Order[] }>(`${constService.API_URL}/orders`);
  }

  getOrder(id: string): Observable<{ order: Order }> {
    return this.http.get<{ order: Order }>(`${constService.API_URL}/orders/${id}`);
  }

  getSellerOrders(): Observable<{ orders: Order[] }> {
    return this.http.get<{ orders: Order[] }>(`${constService.API_URL}/orders/seller`);
  }

  updateOrderStatus(id: string, status: string, trackingNumber?: string): Observable<{ order: Order }> {
    return this.http.put<{ order: Order }>(
      `${constService.API_URL}/orders/${id}/status`,
      { status, trackingNumber }
    );
  }

  markDownloaded(orderId: string, itemId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${constService.API_URL}/orders/${orderId}/items/${itemId}/downloaded`,
      {}
    );
  }
}