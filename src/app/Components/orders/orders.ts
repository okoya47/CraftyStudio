import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CartService } from '../../Services/cart-service';
import { MyOrder } from '../../Models/Cart.model';
import { Auth } from '../../Auth/auth';
import { ToastrService } from 'ngx-toastr';

interface MyOrderWithMeta extends MyOrder {
  canDelete: boolean;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showModal = signal(false);
  readonly selectedOrderId = signal<string | null>(null);
  readonly visibleCount = signal(12);
  readonly showScrollTop = signal(false);
  readonly totalOrdersCount = signal(0);
  readonly now = signal(Date.now());

  private readonly cartService = inject(CartService);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  readonly allOrders = signal<MyOrderWithMeta[]>([]);

  readonly visibleOrders = computed(() =>
    this.allOrders().slice(0, this.visibleCount())
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => {
      this.fetchOrderDetails();
    });

    window.addEventListener('scroll', this.handleScroll.bind(this));

    // Update countdown every second
    setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
  }

  fetchOrderDetails(): void {
    if (this.authService.decodedToken() == null) {
      // this.router.navigate(['signin']);
      // this.toastr.warning("Login to access orders!", "Warnig!");
      return;
    }

    this.cartService.getOrderList().subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) =>
          new Date(b.orderedAt ?? '').getTime() - new Date(a.orderedAt ?? '').getTime()
        );

        const enriched = sorted.map(order => ({
          ...order,
          canDelete: this.canDelete(order.orderedAt ?? '')
        }));

        this.allOrders.set(enriched);
        this.totalOrdersCount.set(enriched.length);
        this.visibleCount.set(Math.min(12, enriched.length));
        this.isLoading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Failed to load order list.');
        this.isLoading.set(false);
      }
    });
  }

  getTimeLeft(orderedAt: string): string {
    if (!orderedAt) return 'Expired';
    const now = this.now();
    const orderTime = new Date(orderedAt).getTime();
    const diff = 24 * 60 * 60 * 1000 - (now - orderTime);

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s left`;
  }

  canDelete(orderedAt: string): boolean {
    if (!orderedAt) return false;
    const now = Date.now();
    const orderTime = new Date(orderedAt).getTime();
    return now - orderTime < 24 * 60 * 60 * 1000;
  }

  showMore(): void {
    this.visibleCount.update(count => count + 12);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.visibleCount.set(Math.min(12, this.totalOrdersCount()));
  }

  handleScroll(): void {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;

    this.showScrollTop.set(scrollY + viewportHeight >= fullHeight - 100);

    if (scrollY < 100) {
      this.visibleCount.set(Math.min(12, this.totalOrdersCount()));
    }
  }

  cancelOrder(orderId: string): void {
    //this.cartService.deleteOrder(orderId).subscribe({
    //  next: () => {
    //    this.toastr.success("Successfully cancelled order!", "Success!");
    //  },
    //  Error: () => {
    //    this.toastr.warning("Failed to delete order!", "Error!");
    //  }
    //})
  }

  openDeleteModal(orderId: string): void {
    this.selectedOrderId.set(orderId);
    this.showModal.set(true);
  }

  confirmDelete(): void {
    const orderId = this.selectedOrderId();
    if (orderId) {
      this.allOrders.update(orders => orders.filter(or => or.id !== orderId));
      this.totalOrdersCount.set(this.allOrders().length);
      this.visibleCount.set(Math.min(12, this.allOrders().length));
      alert(`Delete order` + orderId);
      this.cartService.deleteOrder(orderId);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedOrderId.set(null);
  }
}
