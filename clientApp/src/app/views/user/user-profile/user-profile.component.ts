import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { GetUserRecipeListItemModel } from 'src/app/infrastructure/models/get-user-recipe-list-item.model';
import { UserInfoModel } from 'src/app/infrastructure/models/user-info.model';
import { AuthService } from 'src/app/infrastructure/services/auth.service';
import { ConfirmationService } from 'src/app/infrastructure/services/confirmation.service';
import { FilesService } from 'src/app/infrastructure/services/files.service';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';
import { UserServiceService } from 'src/app/infrastructure/services/user-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  private userId: string;

  public userRecipes: GetUserRecipeListItemModel[] = [];
  public userInfo: UserInfoModel = new UserInfoModel();

  public categories: CategoryModel[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private recipesService: RecipesService,
    private filesService: FilesService,
    private userService: UserServiceService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.userId = id;
        this.fetchData(id);
      }
    });
  }

  private fetchData = (id: string): void => {
    this.loaderService.show();
    this.userService
      .getUserProfile(id)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.userInfo = result;
        },
        (error) => {
          if (error.status == 404) {
            this.router.navigate(['404']);
          }
          if (error.status == 500) {
            this.router.navigate(['500']);
          }
        }
      );

    this.loaderService.show();
    this.userService
      .getUserRecipes(id)
      .pipe(
        finalize(() => {
          this.setRecipeMainImg();
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.userRecipes = result;
        },
        (error) => {
          if (error.status == 404) {
            this.router.navigate(['404']);
          }
          if (error.status == 500) {
            this.router.navigate(['500']);
          }
        }
      );

    this.loaderService.show();

    this.recipesService
      .getRecipeCategories()
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          if (result) {
            this.categories = result;
          }
        },
        (error) => {
          if (error.status == 404) {
            this.router.navigate(['404']);
          }
          if (error.status == 500) {
            this.router.navigate(['500']);
          }
        }
      );
  };

  private setRecipeMainImg = (): void => {
    this.userRecipes.forEach((x) => {
      if (x.mainImageId != null) {
        this.filesService
          .getFileById(+x.recipeId)
          .pipe(finalize(() => {}))
          .subscribe(
            (result) => {
              x.mainImageSrc = 'http://localhost:8000' + result.file;
            },
            (error) => {}
          );
      }
    });
  };

  public getCategoryName(id: number): string {
    if (id > this.categories.length || id == 0) {
      return 'brak kategorii';
    }

    return this.categories.filter(function (item) {
      return item.id === id;
    })[0].name;
  }

  private setMainImgSrc = (
    recipe: GetUserRecipeListItemModel,
    file: File | Blob
  ): void => {
    let myReader: FileReader = new FileReader();

    myReader.onloadend = function (e) {
      recipe.mainImageSrc = myReader.result.toString();
    };
    myReader.readAsDataURL(file);
  };
}
