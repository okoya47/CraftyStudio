import { Component, signal, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Auth } from '../../Auth/auth';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  standalone: true,
  selector: 'app-otp-verification-modal',
  imports: [ FormsModule,
    ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './otp-verification-modal.html',
  styleUrl: './otp-verification-modal.css'
})
export class OtpVerificationModal implements OnInit {
  @Input() email: string = '';

  otpForm!: FormGroup;
  isLoading = signal(false);
  countdown = signal(60);
  errorMsg = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private toastr: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.startCountdown();
    setTimeout(() => this.focusFirstInput(), 300); // wait for modal show
  }

  createForm() {
    this.otpForm = this.fb.group({
      d1: ['', [Validators.required, Validators.pattern(/\d/)]],
      d2: ['', [Validators.required, Validators.pattern(/\d/)]],
      d3: ['', [Validators.required, Validators.pattern(/\d/)]],
      d4: ['', [Validators.required, Validators.pattern(/\d/)]],
      d5: ['', [Validators.required, Validators.pattern(/\d/)]],
      d6: ['', [Validators.required, Validators.pattern(/\d/)]]
    });
  }

  focusFirstInput() {
    const first = document.querySelector('.otp-input') as HTMLInputElement;
    first?.focus();
  }

  onInput(event: any, index: number) {
    const value = event.target.value;
    if (value.length === 1 && index < 5) {
      const next = document.querySelectorAll('.otp-input')[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !(event.target as HTMLInputElement).value && index > 0) {
      const prev = document.querySelectorAll('.otp-input')[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      paste.split('').forEach((char, i) => this.otpForm.get(`d${i + 1}`)?.setValue(char));
      (document.querySelectorAll('.otp-input')[5] as HTMLInputElement)?.focus();
    }
  }

  verify() {
    if (this.otpForm.invalid) return;

    const code = Object.values(this.otpForm.value).join('');
    this.isLoading.set(true);
    this.errorMsg.set('');
    
    this.auth.verifyOtp({ email: this.email, code }).subscribe({
      next: (res: any) => {
        this.toastr.success('Account verified! Welcome!', 'Success');
        this.auth.storeToken(res.accessToken);
        this.auth.storeRefreshToken(res.refreshToken);

        this.closeModal();
        window.location.href = '/';
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.error?.message || 'Invalid or expired code');
        this.toastr.error(this.errorMsg(), 'Error');
      }
    });
  }

  resend() {
    if (this.countdown() > 0) return;

    this.auth.resendOtp({ email: this.email }).subscribe({
      next: (res: any) => {
        this.toastr.success('New code sent!', 'Success');
        this.otpForm.reset();
        this.startCountdown();
        this.focusFirstInput();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to resend', 'Error');
      }
    });
  }

  private startCountdown() {
    this.countdown.set(60);
    const timer = setInterval(() => {
      this.countdown.update(v => {
        if (v <= 1) { clearInterval(timer); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  closeModal() {
    const modal = document.getElementById('otpModal');
    const bsModal = bootstrap.Modal.getInstance(modal);
    bsModal?.hide();
  }
}
