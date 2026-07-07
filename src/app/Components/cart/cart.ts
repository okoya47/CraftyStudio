import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../Services/cart-service';
import { CartItem } from '../../Models/cartItem.model';
import { RouterModule } from '@angular/router';
import { Auth } from '../../Auth/auth';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  private readonly cartService = inject(CartService);

  readonly cart = this.cartService.cart;
  readonly cartItems = signal<CartItem[]>([]);
  readonly totalAmount = signal(0);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private authService : Auth) {
    // Fetch cart on init
     if (this.authService.isLoggedIn()) {
        this.cartService.fetchCart();
     }

    // Reactive effect to sync cartItems and totalAmount
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

  updateCount(id: string, count: number) {
    const parsedCount = Number(count);
    if (!isNaN(parsedCount) && parsedCount > 0) {
      const currentCart = this.cartService.cart();
      const updatedItems = currentCart.cartItems.map(item => {
        if (item.id === id) {
          const updatedTotalPrice = item.price * parsedCount;
          return { ...item, quantity: parsedCount, totalPrice: updatedTotalPrice };
        }
        return item;
      });

      const updatedTotalAmount = updatedItems.reduce(
        (sum, item) => sum + (item.totalPrice ?? item.price * item.quantity),
        0
      );

      this.cartService['cartSignal'].set({
        cartItems: updatedItems,
        totalAmount: updatedTotalAmount
      });

      this.totalAmount.set(updatedTotalAmount);
      this.cartItems.set(updatedItems);

      this.cartService.countItem(id, parsedCount);
    }
  }

  removeItem(id: string) {
    const currentCart = this.cartService.cart();
    const updatedItems = currentCart.cartItems.filter(item => item.id !== id);
    const updatedTotalAmount = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    this.cartService['cartSignal'].set({
      cartItems: updatedItems,
      totalAmount: updatedTotalAmount
    });

    this.totalAmount.set(updatedTotalAmount);
    this.cartItems.set(updatedItems);

    this.cartService.removeItem(id);
  }

  clearCart() {
    this.cartService['cartSignal'].set({
      cartItems: [],
      totalAmount: 0
    });

    this.totalAmount.set(0);
    this.cartItems.set([]);

    this.cartService.clearCart();
  }
}
