import { Product } from "./product.model";

export interface Category {
  id: number;               // Unique identifier for the category
  name: string;             // Name of the category
  description?: string;     // Optional description of the category
  createdAt?: Date;         // Optional timestamp when the category was created
  updatedAt?: Date;         // Optional timestamp when the category was last updated
  isActive?: boolean;       // Optional flag to indicate if the category is active
}
export class Category {
    categoryId!: number;
    name!: string;
    count!: number;
    imagePath?: string;
    products?: Product[];
}