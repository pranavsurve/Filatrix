import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.router.url.split('/').pop();
    if (id) {
      this.orderService.getOrder(id).subscribe({
        next: (res) => {
          this.order.set(res.order);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/orders']);
        }
      });
    }
  }

  getSubtotal(): number {
    return this.order()?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  }

  canDownload(): boolean {
    const status = this.order()?.status;
    return status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered';
  }

  markDownloaded(itemId: string): void {
    const orderId = this.order()!._id;
    this.orderService.markDownloaded(orderId, itemId).subscribe({
      next: () => {
        const order = this.order()!;
        const item = order.items.find(i => i._id === itemId);
        if (item) item.isDownloaded = true;
        this.order.set({ ...order });
        this.snackBar.open('Download marked', 'Close', { duration: 2000 });
      }
    });
  }
}