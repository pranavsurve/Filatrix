import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  constructor(private http: HttpClient) {}

  getWishlist(): Observable<{ wishlist: any }> {
    return this.http.get<{ wishlist: any }>(`${constService.API_URL}/wishlist`);
  }

  addToWishlist(productId: string): Observable<{ wishlist: any }> {
    return this.http.post<{ wishlist: any }>(
      `${constService.API_URL}/wishlist`,
      { productId }
    );
  }

  removeFromWishlist(productId: string): Observable<{ wishlist: any }> {
    return this.http.delete<{ wishlist: any }>(
      `${constService.API_URL}/wishlist/${productId}`
    );
  }

  clearWishlist(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${constService.API_URL}/wishlist`
    );
  }
}