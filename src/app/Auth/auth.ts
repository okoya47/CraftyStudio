import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tokenApiModel } from '../Models/token-api.model';
import { signal } from '@angular/core';
import { environmentBase } from '../Environment/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
 private baseURL: string = environmentBase.productionBase + `/api/Users/`;
  //private baseURL: string = "https://localhost:7229/api/Users/";
  // private baseURL: string = "http://craftwood.runasp.net/api/Users/";
  readonly isLoggedInSignal = signal(this.isLoggedIn());
  // Decode token and expose user info reactively
  private readonly userLoadSignal = signal<any>(null);

  readonly usernameSignal = computed(() => this.userLoadSignal()?.unique_name ?? '');
  readonly emailSignal = computed(() => this.userLoadSignal()?.email ?? '');
  readonly initialSignal = computed(() => this.usernameSignal().charAt(0).toUpperCase());

  private isTokenActive = signal(false);

  checkTokenActive(state: boolean) {
    if (state == true) {
      this.isTokenActive.set(true);
    } else {
      this.isTokenActive.set(false);
    }
  }

  private userLoad: any;

  constructor(
    private http: HttpClient, 
    private route: Router,
    @Inject(PLATFORM_ID) private platformId: Object  // <-- inject platformId
  ) { 
    this.userLoad = this.decodedToken();

   // Rehydrate signals on page refresh
    if (this.isLoggedIn()) {
      this.userLoadSignal.set(this.decodedToken());
      this.isLoggedInSignal.set(true);
    }
  }

  signUp(useObj: any) {
    return this.http.post<any>(`${this.baseURL}Register`, useObj);
  }

  login(useObj: any) {
    return this.http.post<any>(`${this.baseURL}Authenticate`, useObj);
  }

  loggingOut() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      this.isLoggedInSignal.set(false); //  Notify logout
    }
    this.route.navigate(['signin']);
  }

  storeToken(tokenValue: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("token", tokenValue);
      this.userLoadSignal.set(this.decodedToken()); // Refresh signal
      this.isLoggedInSignal.set(true); // Notify login
    }
  }

  storeRefreshToken(tokenValue: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("refreshToken", tokenValue);
    }
  }

  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem("token");
    }
    return null;
  }

  getRefreshToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem("token");
    }
    return false;
  }

  isAdmin(): boolean {
    return this.getRoleFromToken() === 'admin';
  }

  // decodedToken() {
  //   const jwtHelper = new JwtHelperService();
  //   const token = this.getToken();
  //   if (token) {
  //     debugger;
  //     return jwtHelper.decodeToken(token);
  //   }
  //   return null;
  // }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken();

    if (token && token.trim() !== '' && token.split('.').length === 3) {
      return jwtHelper.decodeToken(token);
    }

    console.warn('Invalid or missing token:', token);
    return null;
}


  getFullnameFromToken() {
    if (this.userLoad) {
      return this.userLoad.name;
    }
  }

  getRoleFromToken() {
    if (this.userLoad) {
      return this.userLoad.role;
    }
  }

  getEmailFromToken() {
    if (this.userLoad) {
      return this.userLoad.email;
    }
  }

  renewToken(tokenApi: tokenApiModel) {
    return this.http.post<any>(`${this.baseURL}refresh`, tokenApi);
  }

  verifyOtp(dto: { email: string; code: string }) {
    return this.http.post<any>(`${this.baseURL}verify-otp`, dto);
  }

  resendOtp(dto: { email: string }) {
    return this.http.post<any>(`${this.baseURL}resend-otp`, dto);
  }
}
