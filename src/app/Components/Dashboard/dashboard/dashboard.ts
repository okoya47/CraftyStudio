import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../Services/product-service';
import { Category } from '../../../Models/Category';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../../Models/product.model';
import { CurrencyPipe } from '@angular/common';
import { environmentBase } from '../../../Environment/environment';
// import { Category } from '../../../Models/Category';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  categories: Category[] = [];
  apiUrl: string = environmentBase.productionBase + `/api/Users/`;
  // apiUrl: string = 'https://localhost:7229';  // Your API base URL
  // apiUrl: string = "http://craftwood.runasp.net";
  currentPage: number = 1; // Track current page
  categoriesPerPage: number = 2; // Set how many products per page
  totalPages: number = 0; // Track the total number of pages
  paginatedCategory: Category[] = [];
  deleteId: number = 0;
  deleteCategryName: string = "";

  products: Product[] = [];
  paginatedProducts: Product[] = [];
  productPage: number = 1;
  productsPerPage: number = 3;
  totalProductPages: number = 0;
  deleteProId: number = 0;
  deleteProName: string = "";

  constructor(private productService: ProductService, private toastr: ToastrService,) {
  }
  ngOnInit(): void {
    this.loadItems();
    this.loadProducts();
  }

  loadItems(): void {
  this.productService.getCategories().subscribe((data: Category[]) => {
    this.categories = data.map((category, index) => {
      // Ensure each category has a unique ID
      category.id = category.id ?? `cat-${index}`;
      // Construct the full image URL
      category.imagePath = `${this.apiUrl}${category.imagePath}`;
      category.count = category.products?.length ?? 0;

      return category;
    });

    this.totalPages = Math.ceil(this.categories.length / this.categoriesPerPage);
    this.paginateCategories();
  });
}

  paginateCategories(): void {
    const startIndex = (this.currentPage - 1) * this.categoriesPerPage;
    const endIndex = startIndex + this.categoriesPerPage;
    this.paginatedCategory = this.categories.slice(startIndex, endIndex);
  }

   // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateCategories();
    }
  }
  
  storeDeleteID(id: number, CatName: string){
    this.deleteId = id;
    this.deleteCategryName = CatName;
  }

  storeProDeleteID(id: number, Name: string){
    this.deleteProId = id;
    this.deleteProName = Name;
  }

   DeleteCategory() {
    this.productService.deleteCategory(this.deleteId).subscribe({
      next: (res) => {
        // On successful deletion, filter the deleted id out of the list
        this.categories = this.categories.filter(item => item.categoryId !== this.deleteId);
        this.totalPages = Math.ceil(this.categories.length / this.categoriesPerPage); // Recalculate total pages
        this.paginateCategories();
        this.toastr.success("Category deleted successfully!", "Success");
        },
      error: (err) => {
        this.toastr.error("Failed to delete category!", "Success");
      }
    });
  }

  DeleteProduct(){
     this.productService.deleteProduct(this.deleteProId).subscribe({
      next: (res) => {
        // On successful deletion, filter the deleted id out of the list
        this.products = this.products.filter(item => item.productId !== this.deleteProId);
        this.totalPages = Math.ceil(this.products.length / this.productsPerPage); // Recalculate total pages
        this.paginateProducts();
        this.toastr.success("Product deleted successfully!", "Success");
        },
      error: (err) => {
        this.toastr.error("Failed to delete Product!", "Success");
      }
    });
  }

   // Load Products
  loadProducts(): void {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      this.totalProductPages = Math.ceil(this.products.length / this.productsPerPage);
      this.paginateProducts();
    });
  }

  paginateProducts(): void {
    const startIndex = (this.productPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.paginatedProducts = this.products.slice(startIndex, endIndex);
  }

  changeProductPage(page: number): void {
    if (page >= 1 && page <= this.totalProductPages) {
      this.productPage = page;
      this.paginateProducts();
    }
  }
}
