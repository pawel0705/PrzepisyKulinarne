import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/services/auth.service';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private displayNames: any;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private metaService: Meta
  ) {}

  private setMetaDescripition(text: string) {
    if (text)
      this.metaService.updateTag({ name: 'description', content: text });
  }

  public readonly alertModel: any = {
    class: 'alert-success',
    text: '',
    show: false,
  };

  public errorMessages = {
    required: (...args) => `Pole jest wymagane`,
  };

  private readonly redirectUrl: string = '/home';

  public readonly texts = {
    metaDescription:
      'Zaloguj się do Przepisy Kulinarne, aby uzyskiwać informacje na temat nowych przepisów.',
    password: 'Hasło',
    username: 'Login',
    submit: 'Zaloguj',
    header: 'Logowanie',
    loginFailureMessage: 'Niepoprawny login lub hasło',
    loginSuccessMessage: 'Użytkownik zalogowany poprawnie',
    invalidFormMessage: 'Formularz zawiera błędy',
    createAccountLabel: 'Załóż konto',
    forgotPassword: 'Zapomniałem hasła',
  };

  ngOnInit() {
    this.setMetaDescripition(this.texts.metaDescription);
    this.initForm();
    this.displayNames = this.texts;
  }

  private showAlert = (text: string, className: string, ms: number): void => {
    this.alertModel.class = className;
    this.alertModel.text = text;
    this.alertModel.show = true;
    setTimeout(() => (this.alertModel.show = false), ms);
  };

  validationSuccess = (formValueObject): void => {
    this.loaderService.show();
    this.authService
      .login(formValueObject)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (response) => {
          this.router.navigate([this.redirectUrl]);
          window.location.reload();
        },
        (error) => {
          this.showAlert(this.texts.loginFailureMessage, 'alert-danger', 10000);
        }
      );
  };

  validationFailure = (): void => {
    this.showAlert(this.texts.invalidFormMessage, 'alert-danger', 5000);
  };

  initForm = (): void => {
    let controls = {};

    controls['username'] = new FormControl('', Validators.required);
    controls['password'] = new FormControl('', Validators.required);
    this.form = new FormGroup(controls);
  };

  redirectToRegister = (): void => {
    this.router.navigate(['auth/register']);
  };

  public form: FormGroup;

  private readonly defaultErrorText: string = 'Błąd w polu ';
  private isSubmited: boolean = false;

  onSubmit = (): void => {
    this.isSubmited = true;
    if (this.isValid) this.validationSuccess(this.form.value);
    else this.validationFailure();
  };

  get isValid(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  hasError = (fieldName: string): boolean => {
    const field = this.form.controls[fieldName];
    return field.touched && field.invalid && this.isSubmited;
  };

  get errors() {
    const result: any[] = [];
    Object.keys(this.form.controls).forEach((key) => {
      result.push(...this.collectErrors(key));
    });

    return result;
  }

  public collectErrors = (
    fieldName: string
  ): { fieldName: string; errorMessage: string }[] => {
    const field = this.form.get(fieldName);

    if (this.isSubmited && field.touched && field.errors) {
      const result = Object.keys(field.errors)
        .slice(0, 1)
        .map((key) => {
          return {
            fieldName: fieldName,
            errorMessage: this.getErrorMessage(
              this.errorMessages[`${fieldName}${key}`] ||
                this.errorMessages[key],
              this.getDisplayName(fieldName)
            ),
          };
        });
      return result;
    } else return [];
  };

  private getErrorMessage = (
    f: (...args: string[]) => string,
    displayName: string
  ): string => {
    if (f) return f(displayName);
    return `${this.defaultErrorText}${displayName}`;
  };

  private getDisplayName = (fieldName: string): string => {
    return this.displayNames[fieldName]
      ? this.displayNames[fieldName]
      : fieldName;
  };
}

export interface ErrorMessageMap {
  [validationName: string]: (...args: string[]) => string;
}
