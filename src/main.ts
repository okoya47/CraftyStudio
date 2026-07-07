import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { tokenInterceptorsInterceptor } from './app/Interceptors/token-interceptors-interceptor';

bootstrapApplication(App, {
  providers: [
    provideAnimations(), // Required for Toastr animations
    provideToastr(),      // Toastr service provider
    provideRouter(routes), // 👈 This registers routing providers
   // provideHttpClient(withInterceptorsFromDi()),
    provideHttpClient(withInterceptors([tokenInterceptorsInterceptor]))
  ]
}).catch((err) => console.error(err));










