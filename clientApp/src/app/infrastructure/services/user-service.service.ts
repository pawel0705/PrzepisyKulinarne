import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserDetailsModel } from '../models/user-details.model';
import { Observable } from 'rxjs';
import { GetUserRecipeListItemModel } from 'src/app/infrastructure/models/get-user-recipe-list-item.model';
import { UserInfoModel } from 'src/app/infrastructure/models/user-info.model';

@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  constructor(
    @Inject('BASE_API_URL') private readonly baseApiUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllUsers = (): Observable<UserDetailsModel[]> => {
    return this.http.get<UserDetailsModel[]>(
      `${this.baseApiUrl}/users/getAllUsers`,
      {}
    );
  };

  getUserRecipes = (id: string): Observable<GetUserRecipeListItemModel[]> => {
    return this.http.get<GetUserRecipeListItemModel[]>(
      `${this.baseApiUrl}/user-profile/user-recipes/${id}`
    );
  };

  getUserProfile = (id: string): Observable<UserInfoModel> => {
    return this.http.get<UserInfoModel>(
      `${this.baseApiUrl}/user-profile/profile/${id}`
    );
  };

  deleteUser = (id: string): Observable<Response> => {
    return this.http.delete<Response>(
      `${this.baseApiUrl}/users/deleteUser/${id}`
    );
  };
}
