import {
  Component,
  OnInit,
  TemplateRef,
  Input,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ConfirmedValidator } from 'src/app/infrastructure/validators/ConfirmedValidator';
import { CustomPatternValidator } from 'src/app/infrastructure/validators/CustomPatternValidator';
import { UserRegisterModel } from 'src/app/infrastructure/models/userRegister.model';
import { UserServiceService } from 'src/app/infrastructure/services/user-service.service';
import { finalize, map } from 'rxjs/operators';
import { DomHelper } from 'src/app/infrastructure/helpers/dom-helper';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import {
  Generate,
  PasswordOptions,
} from 'src/app/infrastructure/utils/passwordRegexGenerator';
import { AuthService } from 'src/app/infrastructure/services/auth.service';

@Component({
  selector: 'app-users-registration',
  templateUrl: './users-registration.component.html',
  styleUrls: ['./users-registration.component.css'],
})
export class UsersRegistrationComponent implements OnInit {
  public form: FormGroup;
  public displayNames: any;
  private readonly defaultErrorText: string = 'Błąd w polu ';
  private isSubmited: boolean = false;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.displayNames = this.texts;
  }

  private initForm(): void {
    let controls = {};

    controls['login'] = new FormControl('', [
      Validators.required,
      CustomPatternValidator(
        /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.\-_]{0,19}$/
      ),
    ]);

    controls['email'] = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);

    controls['password'] = new FormControl('', [
      Validators.required,
      CustomPatternValidator(Generate(this._passwordRequirements)),
    ]);

    controls['confirmPassword'] = new FormControl('');

    this.form = new FormGroup(controls, [
      ConfirmedValidator('password', 'confirmPassword'),
    ]);
  }

  public readonly alertModel: any = {
    class: 'alert-success',
    text: '',
    show: false,
    messages: [],
  };

  public loader: boolean = false;

  showFirstPassword: boolean = false;

  showSecondPassword: boolean = false;

  protected readonly errorMessages = {
    loginpattern: (...args) =>
      `${args[0]} może składać się wyłącznie z podstawowych liter, cyfr oraz znaków specjalnych [ . - _ ]. Znak specjalny nie może być znakiem kończącym/rozpoczynającym login.`,
    required: (...args) => `Pole jest wymagane`,
    email: (...args) => `Pole ${args[0]} posiada zły format`,
    mustMatch: (...args) =>
      `Pole ${args[0]} musi mieć taką samą wartość co hasło`,
    minlength: (...args) => `Pole ${args[0]} musi zawierać minimum 6 znaków`,
    pattern: (...args) => this.passwordErrorMessage,
  };

  public readonly texts = {
    password: 'Hasło',
    login: 'Login',
    email: `Adres e\u2011mail`,
    confirmPassword: 'Potwierdź hasło',
    submit: 'Załóż konto',
    name: 'Nazwa',
    header: 'Rejestracja użytkownika',
    registrationError: 'Nie udało się utworzyć konta',
    registrationSuccess: 'Konto założone. Możesz się zalogować.',
    formErrorMessage: 'Formularz zawiera błędy',
    fieldRequiredLabel: 'Pole wymagane',
  };

  private readonly _passwordRequirements: PasswordOptions = {
    minLength: 8,
    requireDigit: true,
    requireLowercase: true,
    requireNonAlphanumeric: true,
    requireUppercase: true,
  };

  toggleShowFirstPassword = (): void => {
    this.showFirstPassword = !this.showFirstPassword;
  };

  toggleShowSecondPassword = (): void => {
    this.showSecondPassword = !this.showSecondPassword;
  };

  get passwordErrorMessage() {
    const components: string[] = [];

    if (this._passwordRequirements.requireLowercase)
      components.push(', małą literę');

    if (this._passwordRequirements.requireUppercase)
      components.push(', wielką literę');

    if (this._passwordRequirements.requireDigit) components.push(', liczbę');

    if (this._passwordRequirements.requireNonAlphanumeric)
      components.push(', znak niealfanumeryczny');

    var result = `Hasło powinno zawierać min. ${this._passwordRequirements.minLength} znaków`;

    return result.concat(...components);
  }

  protected validationSuccess = (formValueObject): void => {
    const formDTO: UserRegisterModel = {
      password: formValueObject.password,
      email: formValueObject.email,
      username: formValueObject.login,
    };

    this.loader = true;
    this.authService
      .register(formDTO)
      .pipe(finalize(() => (this.loader = false)))
      .subscribe(
        (result) => {
          if (result.isCreated == true) {
            this.onSubmitSuccess(result);
          } else {
            this.onSubmitFailure(result.errorMessage);
          }
        },
        (error) => this.onSubmitFailure(error)
      );
  };

  protected validationFailure = (): void => {
    DomHelper.scrollToTop();
    this.showAlert(this.texts.formErrorMessage, 'alert-danger');
  };

  private onSubmitSuccess = (submitResult): void => {
    this.form.reset();
    DomHelper.scrollToTop();
    this.showAlert(this.texts.registrationSuccess, 'alert-success');
  };

  private onSubmitFailure = (result): void => {
    const errorMessages = [];
    Object.keys(result.error.errors).forEach((item) =>
      errorMessages.push(...result.error.errors[item])
    );
    this.showAlert(this.texts.registrationError, 'alert-danger', errorMessages);
    DomHelper.scrollToTop();
  };

  private showAlert = (
    text: string,
    className: string,
    messages: string[] = []
  ): void => {
    this.alertModel.class = className;
    this.alertModel.text = text;
    this.alertModel.messages = messages;
    this.alertModel.show = true;
  };

  closeAlert = (): void => {
    this.alertModel.show = false;
  };

  /**
   * The method that starts handling the form
   * */
  onSubmit = (): void => {
    this.isSubmited = true;
    if (this.isValid) this.validationSuccess(this.form.value);
    else this.validationFailure();
  };

  /**
   * Returns true if all inputs are filled correct
   * */
  get isValid(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  /**
   * Return true if input is filled incorrect
   * */
  hasError = (fieldName: string): boolean => {
    const field = this.form.controls[fieldName];
    return field.touched && field.invalid && this.isSubmited;
  };

  /**
   * Return errors form all inputs
   * */
  get errors() {
    const result: any[] = [];
    Object.keys(this.form.controls).forEach((key) => {
      result.push(...this.collectErrors(key));
    });

    return result;
  }

  /**
   * Return array with first error model for form field
   * @param{string} fieldName key of form property
   * */
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

  /**
   * Builds the error message based on the arguments passed
   * @param{string} displayName the value witch is replaced from default field name
   *
   * */
  private getErrorMessage = (
    f: (...args: string[]) => string,
    displayName: string
  ): string => {
    if (f) return f(displayName);
    return `${this.defaultErrorText}${displayName}`;
  };

  /**
   * Returns display name value if exist in displayNames object else returns provided param
   * @param{string} fieldName key of displayNames property
   * */
  private getDisplayName = (fieldName: string): string => {
    return this.displayNames[fieldName]
      ? this.displayNames[fieldName]
      : fieldName;
  };
}

export interface ErrorMessageMap {
  [validationName: string]: (...args: string[]) => string;
}
