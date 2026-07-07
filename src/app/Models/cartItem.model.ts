// export class CartItem{
//     Id!: string;
//     ProductId! : string;
//     ProductName! : string;
//     Quantity!: number;
//     Price! : number;
//     UserMail!: string;
//     ImageUrl!:string;
// }


// export interface CartItem {
//   id: string;
//   productId: number;
//   productName: string;
//   price: number;
//   quantity: number;
// }


export interface CartItem {
  id: string;
  productName: string;
  productId: number;
  price: number;
  quantity: number;
  totalPrice: number; // Optional if computed in template
  imageUrl: string;
}

