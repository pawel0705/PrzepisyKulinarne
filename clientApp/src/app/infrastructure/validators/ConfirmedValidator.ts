import { FormGroup, ValidatorFn } from "@angular/forms";

export function ConfirmedValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) return;

    matchingControl.setErrors(null);
    if (control.value !== matchingControl.value)
      matchingControl.setErrors({ mustMatch: true });

    return null;
  };
}
