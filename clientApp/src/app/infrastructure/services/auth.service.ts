import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { LoaderService } from './loader.service';
import { RegisterModel } from '../models/register.model';
import { tap, share, finalize, take, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Moment } from 'moment';
import * as moment from 'moment';

const USER_ID_NAME: string = 'USER_ID';
const USERNAME_LOGIN: string = 'LOGIN';
const ACCESS_TOKEN_NAME: string = 'ACCESS_TOKEN';
const REFRESH_TOKEN_NAME: string = 'REFRESH_TOKEN';
const EXPIRATION_DATE_NAME: string = 'EXPIRATION_DATE';
const REFRESH_TOKEN_DATE_NAME: string = 'REFRESH_TOKEN_INTERVAL';

import {
  Observable,
  interval,
  Subscription,
  of,
  Subscriber,
  Subject,
  BehaviorSubject,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedInSubject: Subject<boolean> = new Subject<boolean>();

  private refreshService: Subscription = null;
  public tokenSubscriber: Subject<string>;

  constructor(
    @Inject('BASE_API_URL') private readonly baseApiUrl: string,
    private readonly http: HttpClient,
    private router: Router,
    private loaderService: LoaderService
  ) {
    this.tokenSubscriber = new Subject<string>();
    this.refreshToken((response) => {
      const helper = new JwtHelperService();
      const decodedTokenAccess = helper.decodeToken(response.access);
      let expirationDate = new Date(decodedTokenAccess.exp * 1000);

      this.createRefreshService(moment(expirationDate));
    });
  }

  get loggedUserName() {
    return localStorage.getItem(USERNAME_LOGIN);
  }

  get loggedId() {
    return localStorage.getItem(USER_ID_NAME);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_NAME);
  }

  register = (model: RegisterModel): Observable<any> => {
    return this.http.post<any>(`${this.baseApiUrl}/register`, model);
  };

  login = (model: { username: string; password: string }): Observable<any> => {
    return this.http.post<any>(`${this.baseApiUrl}/login`, model).pipe(
      tap(async (res) => {
        this.setLocalStorage(await res);

        this.loggedInSubject.next(true);
        this.tokenSubscriber.next(res.token);
      }),
      finalize(() => {})
    );
  };

  changeUserToken = async (res: any) => {
    this.setLocalStorage(await res);
    this.tokenSubscriber.next(res.token);
  };

  private setLocalStorage = (response: any): void => {
    const helper = new JwtHelperService();

    const decodetdTokenAccess = helper.decodeToken(response.accessToken);
    const decodetdTokenRefresh = helper.decodeToken(response.refreshToken);

    localStorage.setItem(USER_ID_NAME, response.id);

    localStorage.setItem(ACCESS_TOKEN_NAME, response.accessToken); // access token
    localStorage.setItem(REFRESH_TOKEN_NAME, response.refreshToken); // refresh token

    localStorage.setItem(USERNAME_LOGIN, response.name);

    let expirationDate = new Date(decodetdTokenAccess.exp * 1000);

    localStorage.setItem(EXPIRATION_DATE_NAME, expirationDate.toString()); // token exporation date
    localStorage.setItem(
      REFRESH_TOKEN_DATE_NAME,
      new Date(decodetdTokenRefresh.exp * 1000).toString()
    ); // token exporation date

    this.createRefreshService(moment(expirationDate));
  };

  public logOut = async (): Promise<void> => {
    this.loaderService.show();
    if (this.isLoggedIn) {
      this.http
        .post<void>(`${this.baseApiUrl}/auth/logout`, {})
        .pipe(
          finalize(() => {
            this.clearLocalStorage();
            this.destroyRefreshService();
            this.loggedInSubject.next(false);
            this.tokenSubscriber.next(null);
            this.loaderService.hide();
            this.router.navigate(['/home'], {
              queryParams: { logoutSuccess: 'true' },
            });
          })
        )
        .subscribe(
          (result) => {},
          (error) => {}
        );
    } else {
      this.loaderService.hide();
    }
  };

  private clearLocalStorage = (): void => {
    localStorage.removeItem(USERNAME_LOGIN);
    localStorage.removeItem(USER_ID_NAME);
    localStorage.removeItem(REFRESH_TOKEN_NAME);
    localStorage.removeItem(ACCESS_TOKEN_NAME);
    localStorage.removeItem(EXPIRATION_DATE_NAME);
    localStorage.removeItem(REFRESH_TOKEN_DATE_NAME);
  };

  private destroyRefreshService = (): void => {
    if (this.refreshService) this.refreshService.unsubscribe();
    this.refreshService = null;
  };

  private createRefreshService = (expirationDate: Moment): void => {
    this.destroyRefreshService();
    const intervalInMiliseconds = this.countInterval(expirationDate);

    if (this.refreshService) return;

    this.refreshService = interval(intervalInMiliseconds).subscribe(() =>
      this.refreshToken()
    );
  };

  private countInterval = (expirationDate: Moment): number => {
    const nowTime = moment();
    if (expirationDate.isBefore(nowTime))
      throw new Error('The expiration date is past');

    let intervalMs = expirationDate.diff(nowTime);

    return intervalMs;
  };

  public refreshToken = (pipe: (response) => void = (response) => {}) => {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_NAME);
    if (token && refreshToken) {
      const params = { refresh: refreshToken };
      this.http
        .post<any>(`${this.baseApiUrl}/refresh-token`, params)
        .pipe(
          finalize(() => {
            this.removeOldToken(token, refreshToken);
          })
        )
        .subscribe(
          (res: any) => {
            this.updateTokenValues(res);
            pipe(res);
            this.tokenSubscriber.next(res.token);
          },
          () => this.logOut()
        );
    }
  };

  private removeOldToken = (token: string, refreshToken: string): void => {};

  private updateTokenValues = (response: any): void => {
    const helper = new JwtHelperService();

    const decodedTokenAccess = helper.decodeToken(response.access);
    let tokenExp = decodedTokenAccess.exp;
    localStorage.setItem(ACCESS_TOKEN_NAME, response.access); // access token

    localStorage.setItem(
      EXPIRATION_DATE_NAME,
      new Date(tokenExp * 1000).toString()
    ); // token exporation date
  };
}
