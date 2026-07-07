export class userModel{
    Id! : string;
    username! : string;
    fullname!: number;
    email! : number;
    role!: string;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  pendingOrder: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

