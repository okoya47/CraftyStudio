import { Injectable, inject } from '@angular/core';
import { catchError, BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../Auth/auth';
import { AdminUser, ContactMessage } from '../Models/user.Model';
import { environmentBase } from '../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environmentBase.productionBase + `/api/Users`;
  private role$ = new BehaviorSubject<string>("");
  private fullname$ = new BehaviorSubject<string>("");
  private email$ = new BehaviorSubject<string>("");
  constructor(
    private toastr: ToastrService
  ) { }

  public getFullnameFromStore() {
    return this.fullname$.asObservable();
  }

  public getRoleFromStore() {
    return this.role$.asObservable();
  }
  public getEmailFromStore() {
    return this.email$.asObservable();
  }

  public setFullname(name:string) {
     this.fullname$.next(name);
  }

  public setRole(rol:string) {
    this.role$.next(rol);
 }

  public setEmail(email:string) {
    this.email$.next(email);
  }

  getAdminUserList(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/Users`);
  }

  updateUserRole(userId: string, newRole: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateRole?userId=${userId}&role=${newRole}`, {});
  }

  sendMessage(contact: ContactMessage): Observable<any> {
    return this.http.post(`${this.apiUrl}/review`, contact);
  }
}
