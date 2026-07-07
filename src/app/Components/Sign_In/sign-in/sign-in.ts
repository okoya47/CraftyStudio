import { Component, computed, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../Auth/auth';
import { ToastrService } from 'ngx-toastr';
import validateForm from '../../../helpers/validateForms';
import { ResetService } from '../../../Services/reset-service';
import { UserService } from '../../../Services/user-service';
import { OtpVerificationModal } from '../../otp-verification-modal/otp-verification-modal';
import { Loader } from '../../loader/loader';

@Component({
  selector: 'app-sign-in',
   imports: [
      FormsModule,
      CommonModule,
      ReactiveFormsModule,
      RouterModule,
      OtpVerificationModal,
      Loader  // Imported here
    ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})

export class SignIn {
signInForm!: FormGroup;
public resetPasswordEmail!: string;
isValidEmail!: boolean;
loading = false;

// This will be passed to the OTP modal
registeredEmail: string = '';

constructor(
  private fb: FormBuilder,
  private service:Auth, 
  private router: Router, 
  private toastr: ToastrService,
  private ResetPassword: ResetService,
  private userStore : UserService,
) {}

ngOnInit(): void {
  this.signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })
}

isText = signal(false);
type = computed(() => this.isText() ? 'text' : 'password');
eyeIcon = computed(() => this.isText() ? 'fa-eye' : 'fa-eye-slash');
hideShowPass() {
    this.isText.update(value => !value);
}
checkEmailIsValid(event: string){
  const value = event;
  const pattrn = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  this.isValidEmail = pattrn.test(value);

  return this.isValidEmail;
}

confirmSend(){
  if(this.checkEmailIsValid(this.resetPasswordEmail)){
    // API call goes here
  this.ResetPassword.sendResetPassword(this.resetPasswordEmail).subscribe({
    next:(res)=>{
      this.toastr.success("Password reset was successful!", "Success");
      this.resetPasswordEmail = "";
      const closeBu = document.getElementById("closebtn");
      closeBu?.click();
    },
    error:(err)=>{
      this.toastr.error("Email is not sent!!", "ERROR");
    }
  }) 
}  
}

 onSubmit(){
  if (this.signInForm.invalid) {
      validateForm.validateAllFormFields(this.signInForm);
      this.toastr.error('Please fill all required fields', 'Error');
      return;
  }
  this.loading = true;
  this.service.login(this.signInForm.value).subscribe({
      next: (res: any) => {
        // Case 1: Full login success (tokens present)
        if (res.accessToken && res.refreshToken) {
          this.service.storeToken(res.accessToken);
          this.service.storeRefreshToken(res.refreshToken);

          const payload = this.service.decodedToken();
          this.userStore.setFullname(payload.name);
          this.userStore.setRole(payload.role);
          this.userStore.setEmail(payload.email);

          this.toastr.success('Logged in successfully!', 'Success');
          this.signInForm.reset();
          this.loading = false;
          this.router.navigate(['/']);
          return;
        }

        // Case 2: Email not verified → Show OTP Modal
        if (res.message?.includes('Please verify your email first')) {
          this.loading = false;
          this.registeredEmail = this.signInForm.get('email')?.value;

          this.toastr.info('Please verify your email with the OTP sent to your inbox', 'Verification Required');

          // Open Bootstrap modal
          const modalElement = document.getElementById('otpModal');
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.show();

          // Auto-focus first OTP digit when modal opens
          modalElement?.addEventListener('shown.bs.modal', () => {
            setTimeout(() => {
              const firstInput = document.querySelector('.otp-input') as HTMLInputElement;
              firstInput?.focus();
            }, 100);
          }, { once: true });

          return;
        }

        // Any other response
        this.toastr.warning(res.message || 'Login failed', 'Info');
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Invalid credentials', 'Error');
      }
    });
  }
}