import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResetPass } from '../../../Models/reset-password';
import validateForm from '../../../helpers/validateForms';
import { ResetService } from '../../../Services/reset-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule,
      ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router, 
     private toastr: ToastrService,
    private resetService : ResetService,
  ) {}
  resetPasswordForm!: FormGroup;
  emailToReset!:string;
  emailToken!: string
  resetPasswordObj = new ResetPass();

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      confirmPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });

    
    this.activatedRoute.queryParams.subscribe(val=>{
      this.emailToReset = val['email'];
      let uriToken = val['code'];
      this.emailToken = uriToken.replace(/ /g, '+');
  });
}
reset(){
  if(this.resetPasswordForm.valid){
    this.resetPasswordObj.email = this.emailToReset;
    this.resetPasswordObj.emailToken = this.emailToken;
    this.resetPasswordObj.password = this.resetPasswordForm.value.newPassword;
    this.resetPasswordObj.confirmPassword = this.resetPasswordForm.value.confirmPassword;
  
    this.resetService.resetPassword(this.resetPasswordObj).subscribe({
      next:()=>{
         this.toastr.success("Password reset successfully!", 'Success');
        this.router.navigate(['/signin'])
      },
      error:()=>{
        this.toastr.error("Password is not reset!!", 'Error');
      }
    })

  }else{
    validateForm.validateAllFormFields(this.resetPasswordForm);
  }
}
}