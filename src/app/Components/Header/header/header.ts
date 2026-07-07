import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../Services/cart-service';
import { Auth } from '../../../Auth/auth';
import { UserBadge } from '../../user-badge/user-badge';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule, UserBadge],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  isMenuOpen = false;
  private resizeListener: (() => void) | undefined;
  public fullName: string = 'User';

  private readonly cartService = inject(CartService);
  private readonly authService = inject(Auth);
  readonly auth = inject(Auth);


  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly cartItemCount = this.cartService.itemCount;

  constructor(
    private sanitizer: DomSanitizer,
    private route: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeListener = this.onResize.bind(this);
      window.addEventListener('resize', this.resizeListener);
    }
  }

  signOut(){
    this.authService.loggingOut();
    this.route.navigate(['signin']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  private onResize() {
    if (isPlatformBrowser(this.platformId) && window.innerWidth > 768) {
      this.isMenuOpen = false;
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
}
