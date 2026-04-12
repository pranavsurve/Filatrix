import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { constService } from './const.service';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSignal.set(JSON.parse(user));
    }
  }

  register(data: { email: string; password: string; name: string; role?: string }): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${constService.API_URL}/auth/register`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      })
    );
  }

  login(email: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${constService.API_URL}/auth/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isSeller(): boolean {
    const user = this.currentUserSignal();
    return user?.role === 'seller' || user?.role === 'admin';
  }

  isAdmin(): boolean {
    return this.currentUserSignal()?.role === 'admin';
  }

  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${constService.API_URL}/auth/profile`).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      })
    );
  }

  updateProfile(data: { name?: string; avatar?: string }): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${constService.API_URL}/auth/profile`, data).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      })
    );
  }
}