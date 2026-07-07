// import { CartItem } from "./cartItem.model";
// export class Cart{
//     cartItems!: CartItem[];
//     totalAmount! : number;
// }

import { CartItem } from './cartItem.model';

export interface Cart {
  cartItems: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  priceAtPurchase: number,
  imageUrl: string
}

export interface Order {
  totalAmount: number;
  phone?:string;
  status?: string;
  orderedAt?: string;
  orderType: string;
  Address: string;
  items: OrderItem[];
}

export interface MyOrder {
  id: string;
  totalAmount: number;
  status?: string;
  orderedAt?: string;
  orderType: string;
  Address: string;
  items: OrderItem[];
}

export interface MyOrderDetails{
  id: string;
  email: string;
  totalAmount: number;
  status: string;
  orderedAt: string;
  address: string;
  orderType: string;
  items: OrderItem[];
}

export interface AdminOrder {
  id: string;
  clientName: string;
  orderedAt: string;
  status: string;
}
