import { Injectable } from '@angular/core';
import { ResetPass } from '../Models/reset-password';
import { HttpClient } from '@angular/common/http';
import { environmentBase } from '../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ResetService {
  // private baseUrl: string = "https://localhost:/api/Users/"; 
  private baseUrl: string = environmentBase.productionBase + `/api/Users/`;

  
  constructor(private http: HttpClient) { }
  
  sendResetPassword(email: string){
      return this.http.post<any>(`${this.baseUrl}send-reset-email/${email}`, {});
  }

  resetPassword(resetPasswordObj: ResetPass){
    return this.http.post<any>(`${this.baseUrl}reset-password/`, resetPasswordObj);
  }
}
