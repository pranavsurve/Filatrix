import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';
import { Cart } from '../../shared/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private http: HttpClient) {}

  getCart(): Observable<{ cart: Cart }> {
    return this.http.get<{ cart: Cart }>(`${constService.API_URL}/cart`);
  }

  addToCart(productId: string, quantity: number = 1): Observable<{ cart: Cart }> {
    return this.http.post<{ cart: Cart }>(
      `${constService.API_URL}/cart`,
      { productId, quantity }
    );
  }

  updateCartItem(itemId: string, quantity: number): Observable<{ cart: Cart }> {
    return this.http.put<{ cart: Cart }>(
      `${constService.API_URL}/cart/${itemId}`,
      { quantity }
    );
  }

  removeFromCart(itemId: string): Observable<{ cart: Cart }> {
    return this.http.delete<{ cart: Cart }>(
      `${constService.API_URL}/cart/${itemId}`
    );
  }

  clearCart(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${constService.API_URL}/cart`
    );
  }
}