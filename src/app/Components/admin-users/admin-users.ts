import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {
  users = signal<any[]>([]);

  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAdminUserList().subscribe({
      next: (data) => {
        this.users.set(data);
      },
      error: () => {

      }
    });
  }

  currentPage = signal(1);
  pageSize = 10;

  selectedUser = signal<any | null>(null);
  newRole = signal<string>('User');
  showRoleModal = signal(false);
  showDeleteModal = signal(false);

  visibleUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.users().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.users().length / this.pageSize));

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(v => v - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(v => v + 1); }

  // ✅ Role modal
  openRoleModal(user: any) {
    this.selectedUser.set(user);
    this.newRole.set(user.role);
    this.showRoleModal.set(true);
  }
  closeRoleModal() {
    this.showRoleModal.set(false);
    this.selectedUser.set(null);
  }
  confirmRoleChange() {
    const user = this.selectedUser();
    if (user) {
      user.role = this.newRole();
      this.userService.updateUserRole(user.id, user.role).subscribe({
        next: () => {
          this.toastr.success("Update done successful!", "Success");
        },
        error: () => {
          this.toastr.error("Failed to update.", "error");
        }
      });
    }
    this.closeRoleModal();
  }

  // ✅ Delete modal
  openDeleteModal(user: any) {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedUser.set(null);
  }
  confirmDelete() {
    const user = this.selectedUser();
    if (user) {
      this.users.update(list => list.filter(u => u.id !== user.id));
      // API call here
    }
    this.closeDeleteModal();
  }
}


