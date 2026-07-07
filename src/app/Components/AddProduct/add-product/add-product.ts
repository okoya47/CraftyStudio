import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../Models/product.model';
import { ProductService } from '../../../Services/product-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Loader } from '../../loader/loader';

@Component({
  selector: 'app-add-product',
  imports: [FormsModule,
    ReactiveFormsModule, CommonModule, RouterModule, Loader],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css'
})
export class AddProduct implements OnInit {
  @Input() product: Product = new Product();
  imageFile: File | null = null;
  imageFile1: File | null = null;
  imageFile2: File | null = null;
  category: any =[];
  editId: number = 0;
  formTitle: string = "Add new product";

  loading = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(+id).subscribe({
        next:(res)=>{
        this.product = res;
        },
        error:(err)=>{
          this.router.navigate(['/error']);
        }
      });
      
    }
    this.productService.getCategories().subscribe(res =>{
      this.category = res;
    })
  }

  onFileChange(event: any): void {
    this.imageFile = event.target.files[0];
  }

  onFileChange1(event: any): void {
    this.imageFile1 = event.target.files[0];
  }

  onFileChange2(event: any): void {
    this.imageFile2 = event.target.files[0];
  }

  saveProduct(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      // Update existing product
      this.formTitle = "Edit Product";
      this.productService.updateProduct(id, this.product, this.imageFile, this.imageFile1, this.imageFile2).subscribe((data) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
        this.toastr.success("Product edited is successfully!")
      });
    } else {
      // Create new product
      this.productService.createProduct(this.product, this.imageFile, this.imageFile1, this.imageFile2).subscribe(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
        this.toastr.success("Product added successfully!")
      });
    }
  }
}
