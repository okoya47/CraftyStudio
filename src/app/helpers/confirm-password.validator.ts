import { FormGroup } from "@angular/forms";

export function confirmPasswordValidator(controlName: string, matchControlName: string){
    return (formGroup: FormGroup) => {
        const controlPassword = formGroup.controls[controlName];
        const matchControlPassword = formGroup.controls[matchControlName];

        if(matchControlPassword.errors && matchControlPassword.errors['confirmPasswordValidator']){
            return;
        }

        if(controlPassword.value != matchControlPassword.value){
            matchControlPassword.setErrors({confirmPasswordValidator: true})
        }else{
            matchControlPassword.setErrors(null)
        }
    }
}