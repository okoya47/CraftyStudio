import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../Models/Category';
import { Observable } from 'rxjs/internal/Observable';
import { Product } from '../Models/product.model';
import { environmentBase } from '../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // private apiUrl: string = "https://localhost:7229/api/Product/"; 
  // private apiUrlCat: string = "https://localhost:7229/api/Category/";

  private apiUrl: string = environmentBase.productionBase + `/api/Product/`;
  private apiUrlCat: string = environmentBase.productionBase + `/api/Category/`;
  
  // private apiUrl: string = "http://craftwood.runasp.net/api/Product/"; 
  // private apiUrlCat: string = "http://craftwood.runasp.net/api/Category/"

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrlCat}GetAllCategories`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}GetProducts`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}${id}`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrlCat}${id}`);
  }

  createProduct(product: Product, imageFile: File | null, imageFile1: File | null, imageFile2: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('ProductName', product.productName);
    formData.append('Description', product.description);
    formData.append('Price', product.price.toString());
    formData.append('CategoryId', product.categoryId.toString());
    if (imageFile) {
      formData.append('ImageFile', imageFile);
    }
    if (imageFile1) {
      formData.append('ImageFile1', imageFile1);
    }
    if (imageFile2) {
      formData.append('ImageFile2', imageFile2);
    }

    return this.http.post<Product>(`${this.apiUrl}Create`, formData);
  }

  updateProduct(id: number, product: Product, imageFile: File | null, imageFile1: File | null, imageFile2: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('ProductName', product.productName);
    formData.append('Price', product.price.toString());
    formData.append('CategoryId', product.categoryId.toString());
    if (imageFile) {
      formData.append('ImageFile', imageFile);
    }
    if (imageFile1) {
      formData.append('ImageFile1', imageFile1);
    }
    if (imageFile2) {
      formData.append('ImageFile2', imageFile2);
    }
    return this.http.put<Product>(`${this.apiUrl}${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> { 
    return this.http.delete<void>(`${this.apiUrl}Delete/${id}`);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlCat}Delete/${id}`);
  }

  createCategory(cat: Category, imageFile: File | null): Observable<Category> {
    const formData = new FormData();
    formData.append('CategoryName', cat.name);
    if (imageFile) {
      formData.append('ImageFile', imageFile, imageFile.name);
    }
    return this.http.post<Category>(`${this.apiUrlCat}Create`, formData);
  }

  updateCategory(id: number, cat: Category, imageFile: File | null): Observable<Category> {
    const formData = new FormData();
    formData.append('Name', cat.name);
    if (imageFile) {
      formData.append('ImageFile', imageFile);
    }
    return this.http.put<Category>(`${this.apiUrlCat}Update/${id}`, formData);
  }
}
