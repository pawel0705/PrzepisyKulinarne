import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilesService } from 'src/app/infrastructure/services/files.service';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';
import { UserServiceService } from 'src/app/infrastructure/services/user-service.service';
import { Location } from '@angular/common';
import { GetUserRecipeListItemModel } from 'src/app/infrastructure/models/get-user-recipe-list-item.model';
import { UserInfoModel } from 'src/app/infrastructure/models/user-info.model';
import { AuthService } from 'src/app/infrastructure/services/auth.service';
import { finalize } from 'rxjs/operators';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { ConfirmationService } from 'src/app/infrastructure/services/confirmation.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent implements OnInit {
  public userRecipes: GetUserRecipeListItemModel[] = [];
  public userInfo: UserInfoModel = new UserInfoModel();

  public categories: CategoryModel[] = [];

  public saveRecipeSuccess = false;

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
    let isSaveSuccess = this.route.snapshot.paramMap.get('saveSuccess');

    if (isSaveSuccess === 'true') {
      this.saveRecipeSuccess = true;
    }

    window.scrollTo(0, 0);
    this.fetchData();
  }

  private fetchData = (): void => {
    this.loaderService.show();
    this.userService
      .getUserProfile(this.authService.loggedId)
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
          console.log(error);
        }
      );

    this.loaderService.show();
    this.userService
      .getUserRecipes(this.authService.loggedId)
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

  onRecipeEdit = (recipeId: number): void => {
    this.router.navigate([`recipe/create-recipe/${recipeId}`]);
  };

  onRecipeDelete = (recipeId: number): void => {
    this.confirmRecipeDelete(recipeId);
  };

  private confirmRecipeDelete = (recipeId: number): void => {
    this.confirmationService.createConfirmBase(
      'usuń',
      'Przepis zostanie usunięty. Czy chcesz usunąć?',
      'Tak',
      'Nie',
      () => {
        this.deleteRecipe(recipeId);
      },
      () => {}
    );
  };

  private deleteRecipe = (recipeId: number): void => {
    this.loaderService.show();

    this.recipesService
      .deleteRecipe(recipeId)
      .pipe(
        finalize(() => {
          window.location.reload();
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {},
        (error) => {}
      );
  };

  onUserDelete = (): void => {
    this.confirmUserDelete(this.authService.loggedId);
  };

  private confirmUserDelete = (userId: string): void => {
    this.confirmationService.createConfirmBase(
      'usuń',
      'Konto zostanie usunięte. Czy na pewno chcesz usunąć?',
      'Tak',
      'Nie',
      () => {
        this.deleteUser(userId);
      },
      () => {}
    );
  };

  private deleteUser = (userId: string): void => {
    this.loaderService.show();

    this.userService
      .deleteUser(userId)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.authService.logOut();
        },
        (error) => {}
      );
  };
}
