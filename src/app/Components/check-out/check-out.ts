import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart-service';
import { CartItem } from '../../Models/cartItem.model';
import { ToastrService } from 'ngx-toastr';
import { Loader } from '../loader/loader';
 import { interval, takeWhile, switchMap } from 'rxjs';

@Component({
  selector: 'app-check-out',
  imports: [CommonModule, RouterModule, Loader],
  templateUrl: './check-out.html',
  styleUrl: './check-out.css'
})
export class CheckOut {
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly cart = this.cartService.cart;
  readonly cartItems = signal<CartItem[]>([]);
  readonly totalAmount = signal(0);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly buyNowItem = signal<CartItem | null>(null);
  isSubmitting = false;

  loading = false;

  readonly selectedPaymentMethod = signal<'mpesa' | 'acquire'>('mpesa');
  readonly fulfillmentMethod = signal<'delivery' | 'pickup'>('delivery');
  readonly phoneNumber = signal('');
  readonly address = signal('');
  readonly showMpesaPopup = signal(false);

  constructor(
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.cartService.fetchCart();
    const buyNowRaw = this.route.snapshot.queryParams['buyNowItem'];
    if (buyNowRaw) {
      try {
        const parsed = JSON.parse(buyNowRaw);
        this.buyNowItem.set(parsed);
        this.cartItems.set([parsed]);
        this.totalAmount.set(parsed.price);
        this.isLoading.set(false);
      } catch (e) {
        this.toastr.error("Invalid Buy Now item.");
        this.error.set("Failed to load Buy Now item.");
        this.isLoading.set(false);
      }
    } else {
    effect(() => {
      try {
        const currentCart = this.cart();
        this.cartItems.set(currentCart.cartItems ?? []);
        this.totalAmount.set(currentCart.totalAmount ?? 0);
        this.isLoading.set(false);
        this.error.set(null);
      } catch (e) {
        this.cartItems.set([]);
        this.totalAmount.set(0);
        this.isLoading.set(false);
        this.error.set('Failed to load cart');
      }
    });
  }
  }

  onPhoneChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.phoneNumber.set(input.value);
  }

  onAddressChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.address.set(input.value);
  }

  onPaymentSelect(method: 'mpesa' | 'acquire') {
    this.selectedPaymentMethod.set(method);
  }

  onFulfillmentSelect(method: 'delivery' | 'pickup') {
    this.fulfillmentMethod.set(method);
  }

  confirmMpesa() {
    if (!this.phoneNumber().trim()) {
      this.toastr.error("Phone number is required for Mpesa.");
      return;
    }
    this.showMpesaPopup.set(false);
    this.placeOrder(); // Retry after phone input
    this.phoneNumber.set("");
  }

  cancelMpesa() {
    this.showMpesaPopup.set(false);
    this.phoneNumber.set("");
  }

  placeOrder() {
    if (this.isSubmitting) return;

    if (this.fulfillmentMethod() === 'delivery' && !this.address().trim()) {
      this.toastr.error("Please enter a delivery address.", "Missing Info");
      return;
    }

    if (this.selectedPaymentMethod() === 'mpesa' && !this.phoneNumber().trim()) {
      this.showMpesaPopup.set(true);
      this.toastr.info("Please enter your phone number to proceed with Mpesa.");
      return;
    }

    this.isSubmitting = true;
    
    const items = this.buyNowItem()
      ? [{
          productId: this.buyNowItem()!.productId,
          name: this.buyNowItem()!.productName,
          quantity: 1,
          priceAtPurchase: this.buyNowItem()!.price,
          imageUrl: this.buyNowItem()!.imageUrl ?? '' // fallback
        }]
      : this.cartItems().map(item => ({
          productId: item.productId,
          name: item.productName,
          quantity: item.quantity,
          priceAtPurchase: item.price,
          imageUrl: item.imageUrl
      }));


  var orderPayload = {
    totalAmount: this.totalAmount() + 20,
    status: 'Pending',
    phone: this.phoneNumber.toString(),
    Address: this.fulfillmentMethod() === 'delivery' ? this.address() : 'Pickup',
    orderedAt: new Date().toISOString(),
    orderType: this.selectedPaymentMethod(),
    fulfillmentType: this.fulfillmentMethod(),
    items
  };

  if(orderPayload.orderType === "mpesa") {
  var orderPayloads = orderPayload;
  this.loading = true; // start loading
  this.cartService.processMpesaTransaction(this.phoneNumber(), this.totalAmount())
    .subscribe({
      next: res => {
        const checkoutRequestId = res.checkoutRequestID;

        interval(10000).pipe(
          switchMap(() => this.cartService.confirmMpesaTransaction(checkoutRequestId)),
          takeWhile(confirmRes =>
            confirmRes.paymentStatus !== 'Success' &&
            confirmRes.paymentStatus !== 'Failed' &&
            confirmRes.paymentStatus !== 'Cancelled' &&
            confirmRes.paymentStatus !== 'NoResponse', true)
        ).subscribe({
          next: confirmRes => {
            switch (confirmRes.paymentStatus) {
              case 'Success':
                this.toastr.success(confirmRes.resultDesc, "Success");
                this.cartService.placeOrder(orderPayloads).subscribe({
                  next: orderRes => {
                    this.cartService.clearCart();
                    this.router.navigate(['/confirm-order'], {
                      queryParams: { orderId: orderRes.orderId }
                    });
                    this.loading = false; // stop loading
                  }
                });
                break;

              case 'Failed':
              case 'Cancelled':
              case 'NoResponse':
                this.toastr.error(confirmRes.resultDesc, "Payment Error");
                alert(confirmRes.resultDesc)
                this.phoneNumber.set(''); // clear phone number
                this.isSubmitting = false;
                this.loading = false; // stop loading
                this.showMpesaPopup.set(true); // re-open popup
                break;

              default: // Pending / Processing
                this.toastr.info(confirmRes.resultDesc, "Processing");
                break;
            }
          },
          error: err => {
            this.error.set("Error confirming Mpesa transaction.");
            this.isSubmitting = false;
            this.loading = false; // stop loading
          }
        });
      },
      error: err => {
        this.error.set("Failed to initiate Mpesa transaction.");
        this.isSubmitting = false;
        this.loading = false; // stop loading
      }
    });
}else {
    // Normal order flow
    this.cartService.placeOrder(orderPayload).subscribe({
      next: res => {
        this.toastr.success("Order placed successfully!", "Success");
        this.cartService.clearCart();
        this.router.navigate(['/confirm-order'], {
          queryParams: { orderId: res.orderId }
        });
      },
      error: err => {
        this.error.set("Failed to place order. Please try again.");
        this.isSubmitting = false;
      }
    });
  }
}
}

