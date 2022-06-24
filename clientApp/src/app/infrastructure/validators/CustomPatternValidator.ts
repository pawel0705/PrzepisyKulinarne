import {
  FormGroup,
  ValidatorFn,
  AbstractControl,
  FormControl,
} from "@angular/forms";

export function CustomPatternValidator(regex: string | RegExp): ValidatorFn {
  return (control: FormControl) => {
    const regexInstance = new RegExp(regex);

    if (!regexInstance.test(control.value)) return { pattern: true };

    return null;
  };
}
