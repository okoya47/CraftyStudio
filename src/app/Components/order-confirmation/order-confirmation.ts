import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart-service';
import { CartItem } from '../../Models/cartItem.model';
import { MyOrderDetails, Order } from '../../Models/Cart.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterModule, DatePipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css'
})
export class OrderConfirmation implements OnInit{

orderId!: string;
orderDetails!: MyOrderDetails;
readonly isLoading = signal(true);
readonly error = signal<string | null>(null);

private readonly cartService = inject(CartService);

constructor(private route: ActivatedRoute) {}

ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.fetchOrderDetails(this.orderId);
      }
    });
  }

  fetchOrderDetails(orderId: string): void {
    this.cartService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.orderDetails = data;
         this.isLoading.set(false);
         this.error.set(null);
      },
      error: () => {
        this.error.set('Failed to load order details.');
         this.isLoading.set(false);
      }
    });
  }

  trackByProductId(index: number, item: any): string {
    return item.productId;
  }
}
