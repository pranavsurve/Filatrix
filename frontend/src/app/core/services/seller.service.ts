import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { constService } from './const.service';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<{ stats: any }> {
    return this.http.get<{ stats: any }>(
      `${constService.API_URL}/seller/dashboard/stats`
    );
  }
}