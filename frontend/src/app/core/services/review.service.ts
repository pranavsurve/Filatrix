import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private http: HttpClient) {}

  getProductReviews(productId: string, page = 1, limit = 10): Observable<{ reviews: any[]; pagination: any }> {
    return this.http.get<{ reviews: any[]; pagination: any }>(
      `${constService.API_URL}/products/${productId}/reviews?page=${page}&limit=${limit}`
    );
  }

  addReview(productId: string, rating: number, comment: string): Observable<{ review: any }> {
    return this.http.post<{ review: any }>(
      `${constService.API_URL}/products/${productId}/reviews`,
      { rating, comment }
    );
  }

  updateReview(reviewId: string, rating: number, comment: string): Observable<{ review: any }> {
    return this.http.put<{ review: any }>(
      `${constService.API_URL}/reviews/${reviewId}`,
      { rating, comment }
    );
  }

  deleteReview(reviewId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${constService.API_URL}/reviews/${reviewId}`
    );
  }
}