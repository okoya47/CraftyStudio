import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { tokenApiModel } from '../Models/token-api.model';
import { Auth } from '../Auth/auth';

// Backend endpoints that should bypass token logic
const PUBLIC_ENDPOINTS: string[] = [
  '/register',
  '/signin',
  '/forgot-password',
  '/products/public'
];

// Frontend routes that should suppress token refresh logic
const PUBLIC_UI_ROUTES: string[] = [
  '/signin',
  '/register',
  '/'
];

// Utility to check if request URL matches public backend endpoints
function isExcludedEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

export const tokenInterceptorsInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(Auth);
  const toastr = inject(ToastrService);
  const router = inject(Router);

  const token = authService.getToken();
  const isPublicEndpoint = isExcludedEndpoint(req.url);
  const currentRoute = router.url;

  const isOnPublicPage = PUBLIC_UI_ROUTES.some(route => currentRoute === route);

  if (token && !isPublicEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Interceptor triggered');
    console.log('Token:', token);
    console.log('Request URL:', req.url);
  }

  return next(req).pipe(
    catchError((err: any): Observable<HttpEvent<any>> => {
      const hasToken = !!authService.getToken();

      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        hasToken &&
        !isPublicEndpoint &&
        !isOnPublicPage
      ) {
        const tokenModel: tokenApiModel = {
          accessToken: authService.getToken()!,
          refreshToken: authService.getRefreshToken()!
        };

        return authService.renewToken(tokenModel).pipe(
          switchMap((data: tokenApiModel): Observable<HttpEvent<any>> => {

            authService.storeToken(data.accessToken);
            authService.storeRefreshToken(data.refreshToken);

            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${data.accessToken}`
              }
            });

            return next(clonedReq);
          }),
          catchError(() => {
            toastr.warning('Token expired. Please login again.', 'Warning');
            router.navigate(['signin']);
            return throwError(() => new Error('Token refresh failed.'));
          })
        );
      }

      return throwError(() => err);
    })
  );
};
