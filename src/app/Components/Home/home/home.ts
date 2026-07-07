import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../../Models/Category';
import { ProductService } from '../../../Services/product-service';
import { Product } from '../../../Models/product.model';
import { Router, RouterModule } from '@angular/router';
import { environmentBase } from '../../../Environment/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

private resizeListener: () => void;
showPopup = false;
videoUrl: SafeResourceUrl;
isMenuOpen = false;
categories: Category[] = [];
products: Product[] = [];
apiUrl: string = environmentBase.productionBase;
// apiUrl: string = 'https://localhost:7229';  // Your API base URL
// apiUrl: string = "http://craftwood.runasp.net"; 
constructor(private sanitizer: DomSanitizer, private toastr: ToastrService, private productService: ProductService) {
  this.resizeListener = this.onResize.bind(this);
  window.addEventListener('resize', this.resizeListener);
  // Use DomSanitizer to safely set the video URL
  this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/IwF4kex2smY?si=u8ub28hEB5oyBjs3');

  }
  ngOnInit(): void {
     this.productService.getCategories().subscribe((data: Category[]) => {
      this.categories = data.map(category => {
        // Construct the full image URL for each category
        category.imagePath = `${this.apiUrl}${category.imagePath}`;
        category.count = category.products?.length ?? 0;
        return category;
      });
    });

    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data.slice(0, 6).map(product => {
        // Construct the full image URL for each product
        product.imagePath = `${this.apiUrl}${product.imagePath}`;
        return product;
      });
    });
  }

 openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
  private onResize() {
    if (window.innerWidth > 768) {
      this.isMenuOpen = false; // Close the menu when transitioning to desktop view
    }
  }
}
