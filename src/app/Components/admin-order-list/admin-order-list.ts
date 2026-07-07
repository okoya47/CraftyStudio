import { Component, signal, computed, OnInit, inject} from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CartService } from '../../Services/cart-service';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-order-list',
  imports: [NgFor, NgIf, NgClass, FormsModule, DatePipe, RouterModule],
  templateUrl: './admin-order-list.html',
  styleUrl: './admin-order-list.css'
})
export class AdminOrderList implements OnInit {
  // Signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  orders = signal<any[]>([]);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.cartService.getAdminOrderList().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: () => {
        this.toastr.error("Failed to retrieve list of users.", "error");
      }
    });
  }

  currentPage = signal(1);
  pageSize = 10;

  selectedOrder = signal<any | null>(null);
  newStatus = signal<string>('');   // ✅ signal instead of property
  showModalFlag = signal(false);

  // ✅ Computed signals
  visibleOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.orders().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.orders().length / this.pageSize));

  // Pagination
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(v => v - 1);
  }
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(v => v + 1);
  }

  // Modal
  openUpdateModal(order: any) {
    this.selectedOrder.set(order);
    this.newStatus.set(order.status);
    this.showModalFlag.set(true);
  }
  closeUpdateModal() {
    this.showModalFlag.set(false);
    this.selectedOrder.set(null);
  }
  confirmUpdate() {
    const order = this.selectedOrder();
    if (order) {
      order.status = this.newStatus();
      this.cartService.updateOrderStatus(order.id, this.newStatus()).subscribe({
        next: (data) => {
          this.toastr.success("Update done successful!", "Success");
        },
        error: () => {
          this.toastr.error("Failed to update.", "error");
        }
      });
    }
    this.closeUpdateModal();
  }
}
