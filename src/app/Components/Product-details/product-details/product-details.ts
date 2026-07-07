import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../Services/product-service';
import { Product } from '../../../Models/product.model';
import { Auth } from '../../../Auth/auth';
import { ToastrService } from 'ngx-toastr';
import { CartItem, newCartItem } from '../../../Models/newCartItem';
import { CartService } from '../../../Services/cart-service';
import { FormsModule } from '@angular/forms';
import { environmentBase } from '../../../Environment/environment';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
  imports: [FormsModule]
})
export class ProductDetails implements OnInit, OnDestroy {
  apiUrl: string = environmentBase.productionBase;
  // apiUrl: string = 'https://localhost:7229';
  // apiUrl: string = "http://craftwood.runasp.net";
  product: Product | null = null;
  productId: number = 0;
  category: any[] = [];
  productImages: { imgUrl: string; altText: string }[] = [];
  selectedImageIndex: number = 0;
  intervalId: any;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private authService: Auth,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!;

    this.productService.getProduct(this.productId).subscribe((product: Product) => {
      product.imagePath = `${this.apiUrl}/${product.imagePath}`;
      product.imagePath1 = `${this.apiUrl}/${product.imagePath1}`;
      product.imagePath2 = `${this.apiUrl}/${product.imagePath2}`;

      this.productImages = [
        { imgUrl: product.imagePath, altText: 'Image 1' },
        { imgUrl: product.imagePath1, altText: 'Image 2' },
        { imgUrl: product.imagePath2, altText: 'Image 3' }
      ];

      this.product = product;
      this.startImageRotation();
    });

    this.productService.getCategories().subscribe((res: any[]) => {
      this.category = res;
    });
  }

  addToCart(productId: number, productName: string, price: number, quantity: number, imagePath?: string) {
      if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Please log in to add items to your cart.', 'Login Required');
      this.router.navigate(['/signin']);
      return;
      }
      const item: CartItem = {
        productId,
        productName,
        price,
        quantity,
        imageUrl : imagePath ?? ''
      };
      this.cartService.addItem(item);
      // this.toastr.success('Item added to cart.', 'Success');
    }

  buyNow(productId: number, productName: string, price: number, quantity: number) {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Please log in to proceed with Buy Now.', 'Login Required');
      this.router.navigate(['/signin']);
      return;
    }

    const buyNowItem = {
      productId,
      productName,
      price,
      quantity
    };

    this.router.navigate(['/CheckOut'], {
      queryParams: {
        buyNowItem: JSON.stringify(buyNowItem)
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  startImageRotation(): void {
    this.intervalId = setInterval(() => {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.productImages.length;
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
