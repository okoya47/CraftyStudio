import { Component, OnInit } from '@angular/core';
import { Product } from '../../../Models/product.model';
import { ProductService } from '../../../Services/product-service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Services/cart-service';
import { CartItem, newCartItem } from '../../../Models/newCartItem';
import { Auth } from '../../../Auth/auth';
import { environmentBase } from '../../../Environment/environment';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: Product[] = [];
  paginatedProducts: Product[] = [];
  apiUrl: string = environmentBase.productionBase;
  //apiUrl: string = 'https://localhost:7229';  // Your API base URL
  // apiUrl: string = "http://craftwood.runasp.net";
  deleteId: number = 0;
  deleteProductName: string = "";

  currentPage: number = 1; // Track current page
  productsPerPage: number = 8; // Set how many products per page
  totalPages: number = 0; // Track the total number of pages

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private cartService: CartService,
   // private userStore: UserServiceService,
    private authService: Auth
  ) {}


  userEmail: string = "";
  role: string = "";
  sortBy: string = "default";

 
  ngOnInit(): void {
    this.loadItems();

    // this.userStore.getEmailFromStore().subscribe(val=>{
    //   debugger;
    //   let emailFromToken = this.service.getEmailFromToken();
    //   this.userEmail = val || emailFromToken;
    // })

    // this.userStore.getRoleFromStore().subscribe(val=>{
    //   let roleFromToken = this.service.getRoleFromToken();
    //   this.role = val || roleFromToken
    // })

    // this.cartService.getCart().subscribe();
  }

  // clickProductAdd(prod: Product){
  //   const productId = String(prod.productId);
  //   const imgCart = String(prod.imagePath);
  //   this.addItem({ProductId: productId, ProductName: prod.productName, Quantity: 1, Price: prod.price, UserMail: '', ImageUrl: imgCart})
  // }

  addItem (item: {ProductId: string; ProductName: string; Quantity: number; Price: number; UserMail: string; ImageUrl: string}): void{
    
    item.UserMail = this.userEmail;
    // this.cartService.addItem(item).subscribe({
    //  // next: () => console.log('Item added successfully.'),
    //  // error: (err) => console.error('Error while adding item to cart:', err)
    // });
  }

  storeDeleteID(id: number, productName: string){
    this.deleteId = id;
    this.deleteProductName = productName;
   
  }

  loadItems(): void {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data.map(product => {
        // Construct the full image URL for each product
        product.imagePath = `${this.apiUrl}${product.imagePath}`;
        return product;
      });
      this.totalPages = Math.ceil(this.products.length / this.productsPerPage); // Calculate total pages
      this.paginateProducts();
    });
  }

  // Paginate the products to show only the products for the current page
  paginateProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.paginatedProducts = this.products.slice(startIndex, endIndex);
  }

  // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateProducts();
    }
  }

  DeleteProduct() {
    this.productService.deleteProduct(this.deleteId).subscribe({
      next: (res) => {
       
      },
      error: (err) => {
       
      }
    });
  }

   // Apply sorting to products
   applySorting(): void {
    if (this.sortBy === 'low-to-high') {
      this.products.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'high-to-low') {
      this.products.sort((a, b) => b.price - a.price);
    } else{
      this.loadItems();
    }
    // else if (this.sortBy === 'popularity') {
    //   this.products.sort((a, b) => b.popularity - a.popularity); // Assume products have a `popularity` field
    // } else if (this.sortBy === 'rating') {
    //   this.products.sort((a, b) => b.rating - a.rating); // Assume products have a `rating` field
    // }
    // Default case does nothing (no sorting applied)
  }

  // Method to handle sort change
  onSortChange(event: any): void {
    this.sortBy = event.target.value; // Capture the selected sort option
    this.applySorting(); // Apply sorting when the user changes the filter
    this.paginateProducts(); // Recalculate pagination based on sorted products
  }

  addToCart(productId: number, productName: string, price: number, imagePath?: string) {
    
    if (!this.authService.isLoggedIn()) {
    this.toastr.warning('Please log in to add items to your cart.', 'Login Required');
    this.router.navigate(['/signin']);
    return;
    }
    const item: CartItem = {
      productId,
      productName,
      price,
      quantity: 1,
      imageUrl: imagePath  ?? ''    
    };
    this.cartService.addItem(item)
  }
}
