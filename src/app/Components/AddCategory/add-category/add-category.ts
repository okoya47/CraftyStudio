import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../../Models/Category';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../Services/product-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Loader } from '../../loader/loader';

@Component({
  selector: 'app-add-category',
  imports: [FormsModule,
    ReactiveFormsModule, CommonModule, RouterModule, Loader],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css'
})
export class AddCategory implements OnInit {
  categoryTitle: string = "Add a new category";
  imageFile: File | null = null;
  @Input() category: Category = new Category();
  loading = false;
  
  onFileChange(event: any): void {
    this.imageFile = event.target.files[0];
  }
  saveCategory(): void{
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Update existing product
      this.productService.updateCategory(+id, this.category, this.imageFile).subscribe(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
        this.toastr.success("Category edited is successfully!")
      });
    } else {
      // Create new category
      this.productService.createCategory(this.category, this.imageFile).subscribe(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
        this.toastr.success("Category added is successfully!")
      });
    }
  }

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ){}
  ngOnInit(): void{
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getCategory(+id).subscribe({
        next:(res)=>{
        this.category = res;
        this.categoryTitle = "Edit category";
        },
        error:(err)=>{
          this.router.navigate(['/error']);
        }
      });
      
    }
  }
}

