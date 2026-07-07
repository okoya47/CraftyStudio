
import { Injectable, signal, effect, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { CartItem, newCartItem } from '../Models/newCartItem';
import { AdminOrder, Cart, MyOrder, MyOrderDetails, Order } from '../Models/Cart.model';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../Auth/auth';
import { environmentBase } from '../Environment/environment';
import { Router } from '@angular/router';
import { ContactMessage } from '../Models/user.Model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: Auth // ✅ Inject AuthService
  ){}

  private readonly http = inject(HttpClient);
  //private readonly apiUrl = 'https://localhost:7229/api/Cart/';
  //private readonly apiUrl2 = 'https://localhost:7229/api/Cart/';
  //private readonly apiUrl3 = 'https://localhost:7229/api/Cart/Order_list';

  private readonly apiUrl: string = environmentBase.productionBase + `/api/Cart`;
  private readonly apiUrl2: string = environmentBase.productionBase + `/api/Cart/Order`;
  private readonly apiUrl3: string = environmentBase.productionBase + `/api/Cart/Order_list`;
  private readonly apiUrlMpesa: string = environmentBase.productionBase;
  

  // private readonly apiUrl = 'http://craftwood.runasp.net/api/Cart/';
  // private readonly apiUrl2 = 'http://craftwood.runasp.net/api/Cart/Order';
  // private readonly apiUrl3 = 'http://craftwood.runasp.net/api/Cart/Order_list';

  // Signal to hold cart state
  private readonly cartSignal = signal<Cart>({ cartItems: [], totalAmount: 0 });

  // Public getter for components
  readonly cart = this.cartSignal.asReadonly();

  readonly itemCount = computed(() => this.cartSignal().cartItems?.length ?? 0);

  // Fetch cart from backend only if logged in
  fetchCart(): void {
    if (this.authService.decodedToken() == null) {
     // this.router.navigate(['signin']);
     // this.toastr.warning("Login to access orders!", "Warnig!");
      return;
    }

    this.http.get<Cart>(`${this.apiUrl}/items`)
      .pipe(
        catchError(err => {
          return of({ cartItems: [], totalAmount: 0 });
        })
      )
      .subscribe(cart => {
        this.cartSignal.set(cart);
      });
  }


  //// ➕ Add item to cart
  //addItem(item: CartItem): void {
  //  debugger;
  //  this.http.post<void>(`${this.apiUrl}/add`, item)
  //    .pipe(catchError(err => {
  //      console.error('Failed to add item', err);
  //      return of(undefined);
  //    }))
  //    .subscribe(() => this.fetchCart());

  //    this.toastr.success(`${item.productName} added to cart!`, 'Success');
  //}

  addItem(item: CartItem): void {
    this.http.post<void>(`${this.apiUrl}/add`, item)
      .subscribe({
        next: () => {
          // only runs if backend returned 200 OK
          this.fetchCart();
          this.toastr.success(`${item.productName} added to cart!`, 'Success');
        },
        error: (err) => {
          console.error('Failed to add item', err);
          this.toastr.error('Could not add item to cart', 'Error');
        }
      });
  }


  // Remove item from cart
  removeItem(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/remove/${id}`)
      .pipe(catchError(err => {
        console.error('Failed to remove item', err);
        return of(undefined);
      }))
      .subscribe(() => this.fetchCart());
  }

  // Update item count
  countItem(id: string, count: number): void {
    this.http.put<void>(`${this.apiUrl}/cartItemCount/${id}`, count)
      .pipe(catchError(err => {
        console.error('Failed to update count', err);
        return of(undefined);
      }))
      .subscribe(() => this.fetchCart());
  }

//  Clear cart
clearCart(): void {
  this.http.delete<void>(`${this.apiUrl}/clearCart`)
    .pipe(catchError(err => {
      console.error('Failed to clear cart', err);
      return of(undefined);
    }))
    .subscribe(() => this.fetchCart());
}

processMpesaTransaction(phone: string, amount: number): Observable<any>{
  return this.http.post<{phone: string, amount: number}>(`${this.apiUrlMpesa}/api/mpesa/stkpush`, {phone, amount});
}

confirmMpesaTransaction(checkoutRequestId: string): Observable<any>{
 return this.http.get<AdminOrder[]>(`${this.apiUrlMpesa}/api/mpesa/status/${checkoutRequestId}`);;
}

placeOrder(order: Order): Observable<{ orderId: number }> {
  return this.http.post<{ orderId: number }>(this.apiUrl, order);
}

getOrderById(orderId: string): Observable<MyOrderDetails> {
  return this.http.get<MyOrderDetails>(`${this.apiUrl2}?orderId=${orderId}`);
}

getOrderList(): Observable<MyOrder[]> {
return this.http.get<MyOrder[]>(`${this.apiUrl3}`);
}

getAdminOrderList(): Observable<AdminOrder[]> {
  return this.http.get<AdminOrder[]>(`${this.apiUrl}/OrderAdmin`);
}

  deleteOrder(orderId: string): void {
    alert("method");
    this.http.delete<void>(`${this.apiUrl2}/delete?OrderId=${orderId}`)
      .subscribe({
        next: () => this.toastr.success("Delete was successful!", "Success"),
        error: err => this.toastr.error("Failed to delete!", "Error")
      });
  }


updateOrderStatus(orderId: string, newStatus: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/UpdateStatus?orderId=${orderId}&status=${newStatus}`, {});
  }
}
