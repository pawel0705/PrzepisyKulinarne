import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { RecipeFileUploadModel } from '../models/RecipeFileUpload.model';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(
    @Inject('BASE_API_URL') private readonly baseApiUrl: string,
    private readonly http: HttpClient
  ) {}

  getFileById = (id: number): Observable<RecipeFileUploadModel> => {
    return this.http.get<RecipeFileUploadModel>(
      `${this.baseApiUrl}/recipes/get-image/${id}`,
      {}
    );
  };
}
