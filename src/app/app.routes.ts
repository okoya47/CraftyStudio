import { Routes } from '@angular/router';
import { Home } from './Components/Home/home/home';
import { Orders } from './Components/orders/orders';
import { adminCheckGuard } from './Guard/admin-check-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'home', component: Home},
    { path: 'contact-us', loadComponent:()=> import('./Components/contact-us/contact-us').then(m=>m.ContactUs)},
    { path: 'about-us', loadComponent:()=> import('./Components/About-us/about-us/about-us').then(m=>m.AboutUs)},
    { path: 'dashboard', loadComponent: ()=> import('./Components/Dashboard/dashboard/dashboard').then(d=> d.Dashboard), canActivate: [adminCheckGuard]},     
    { path: 'signin', loadComponent: ()=> import('./Components/Sign_In/sign-in/sign-in').then(r=>r.SignIn)},
    { path: 'signup', loadComponent: ()=> import('./Components/Sign_Up/sign-up/sign-up').then(s=>s.SignUp)},
    { path: 'resetpassword', loadComponent: ()=> import('./Components/ResetPassword/reset-password/reset-password').then(r=>r.ResetPassword)},
    //{ path: 'reset-password', loadComponent: ()=> import('./Components/ResetPassword/reset-password/reset-password').then(p=>p.ResetPassword)},
    { path: 'AddCategory', loadComponent: () => import('./Components/AddCategory/add-category/add-category').then(p => p.AddCategory), canActivate: [adminCheckGuard] },
    { path: 'orders', loadComponent: () => import('./Components/admin-order-list/admin-order-list').then(p => p.AdminOrderList), canActivate: [adminCheckGuard] },
    { path: 'users', loadComponent: () => import('./Components/admin-users/admin-users').then(p => p.AdminUsers), canActivate: [adminCheckGuard] },
    { path: 'AddProduct', loadComponent: () => import('./Components/AddProduct/add-product/add-product').then(p => p.AddProduct), canActivate: [adminCheckGuard] },
    { path: 'AddCategory/:id', loadComponent: () => import('./Components/AddCategory/add-category/add-category').then(p => p.AddCategory), canActivate: [adminCheckGuard] },
    { path: 'AddProduct/:id', loadComponent: () => import('./Components/AddProduct/add-product/add-product').then(p => p.AddProduct), canActivate: [adminCheckGuard] },
    { path: 'products', loadComponent: () => import('./Components/Products/products/products').then(e=>e.Products)},
    { path: 'error', loadComponent: ()=> import('./Components/Error/error/error').then(x=>x.Error)},
    { path: 'product-details/:id', loadComponent: ()=> import('./Components/Product-details/product-details/product-details').then(s=>s.ProductDetails) },
    { path: 'cart', loadComponent: ()=> import('./Components/cart/cart').then(c=>c.Cart)},
    { path: 'confirm-order', loadComponent: () => import('./Components/order-confirmation/order-confirmation').then(o => o.OrderConfirmation) },
    { path: 'CheckOut', loadComponent: ()=> import('./Components/check-out/check-out').then(c=>c.CheckOut)},
    { path: 'my-orders', loadComponent: () => import('./Components/orders/orders').then(o=>o.Orders)},
    { path: '**', redirectTo: 'error' }
];
