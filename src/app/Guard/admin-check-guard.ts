import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Auth } from '../Auth/auth';
import { ToastrService } from 'ngx-toastr';

export const adminCheckGuard: CanActivateFn = (route : ActivatedRouteSnapshot, state: RouterStateSnapshot ) => {
  if (inject(Auth).isAdmin()) {
    return true;
  } else {
    inject(ToastrService).warning("Access Denied!", "Warning")
    inject(Router).navigate(['error']);
    return false;
  }
};
