import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../../Auth/auth';
import { OtpVerificationModal } from '../../otp-verification-modal/otp-verification-modal';
import validateForm from '../../../helpers/validateForms';
import { Loader } from '../../loader/loader';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    OtpVerificationModal,
    Loader  // Imported here
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp implements OnInit {
  signUpForm!: FormGroup;

  // UI Signals
  isText = signal(false);
  type = computed(() => this.isText() ? 'text' : 'password');
  eyeIcon = computed(() => this.isText() ? 'fa-eye' : 'fa-eye-slash');
  loading = false;

  // This will be passed to the OTP modal
  registeredEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private service: Auth,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  hideShowPass() {
    this.isText.update(v => !v);
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      validateForm.validateAllFormFields(this.signUpForm);
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    this.loading = true;

    this.service.signUp(this.signUpForm.value).subscribe({
      next: (res: any) => {
        this.registeredEmail = this.signUpForm.get('email')?.value;
        this.toastr.success(res.message || 'Check your email for OTP!', 'Success');
        this.signUpForm.reset();

        this.loading = false;

        // Open Bootstrap modal
        const modalElement = document.getElementById('otpModal');
        const modal = new (window as any).bootstrap.Modal(modalElement);
       // const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Auto-focus first OTP input when modal is fully visible
        modalElement?.addEventListener('shown.bs.modal', () => {
          setTimeout(() => {
            const firstInput = document.querySelector('.otp-input') as HTMLInputElement;
            firstInput?.focus();
          }, 100);
        }, { once: true });
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || 'Registration failed', 'Error');
      }
    });
  }
}