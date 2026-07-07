import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Header } from './Components/Header/header/header';
import { Footer } from './Components/Footer/footer/footer';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CartService } from './Services/cart-service';
import { Auth } from './Auth/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, MatIconModule, CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
protected readonly title = signal('craftyStudio');

constructor(private router: Router){}
   isAuthPage(): boolean {
      return this.router.url.includes('/signin') || this.router.url.includes('/signup') || this.router.url.includes('/resetpassword');
     }

  private readonly cartService = inject(CartService);
  private readonly authService = inject(Auth); // Or however you check login

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.cartService.fetchCart();
    }
  }
}




