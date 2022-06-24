import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DomHelper } from 'src/app/infrastructure/helpers/dom-helper';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { RecipeListItemModel } from 'src/app/infrastructure/models/recipe-list-item.model';
import { RecipeListModel } from 'src/app/infrastructure/models/recipe-list.model';
import { RecipeMainPageItemModel } from 'src/app/infrastructure/models/recipe-main-page-item.model';
import { FilesService } from 'src/app/infrastructure/services/files.service';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';
import { RecipesFilterComponent } from '../recipes-filter/recipes-filter.component';

declare var $: any;

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.css'],
})
export class RecipesListComponent implements OnInit, AfterViewInit {
  @ViewChild('recipesFilterDesktop', { static: false })
  filterRefDesktop: RecipesFilterComponent;

  recipeLabel: string = 'Przepisy kulinarne';

  notFoundLabel: string = 'Brak wpisów spełniających podane wymagania.';

  recipes: RecipeMainPageItemModel[] = [];

  noRecipes: boolean;

  public categories: CategoryModel[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private loaderService: LoaderService,
    private recipesService: RecipesService,
    private filesService: FilesService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showRecipes();
    }, 50);

    $(window).scroll(() => {
      this.showRecipes();
    });
  }

  ngOnInit(): void {
    this.document.documentElement.lang = 'pl';
    this.fetchRecipes();
    DomHelper.scrollToTop();
  }

  private showRecipes() {
    setTimeout(() => {
      (<any>$('.js-recipe-observer')).each(function () {
        var docViewTop = (<any>$(window)).scrollTop();
        var docViewBottom = docViewTop + (<any>$(window)).height();

        var elemTop = (<any>$(this)).offset().top;
        var elemBottom = elemTop + (<any>$(this)).height() - 25;

        if (elemBottom <= docViewBottom && elemTop >= docViewTop) {
          (<any>$(this)).addClass('fadeIn-recipe');
        }
      });
    }, 100);
  }

  private fetchRecipes = (): void => {
    this.loaderService.show();
    this.recipesService
      .getAllRecipes(this.getRecipesParams())
      .pipe(
        finalize(() => {
          this.setRecipeMainImg();
          this.loaderService.hide();
          this.setNotFound();
          this.showRecipes();
        })
      )
      .subscribe(
        (result) => {
          this.recipes = result;
        },
        (error) => {}
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
        (error) => {}
      );
  };

  public getCategoryName(id: number): string {
    if (id > this.categories.length || id == 0) {
      return 'brak kategorii';
    }

    return this.categories.filter(function (item) {
      return item.id === id;
    })[0].name;
  }

  private getRecipesParams = (): HttpParams => {
    let params = new HttpParams();

    params = this.setFilterRequestParams(params);

    return params;
  };

  private setFilterRequestParams = (params: HttpParams): HttpParams => {
    if (this.filterRefDesktop) {
      const filter = this.filterRefDesktop.getActiveFilters();

      if (filter.title != null && filter.title != '') {
        params = params.append('title', filter.title);
      }

      if (filter.sort === 'DateDesc') {
        params = params.append('orderByDateDesc', 'false');
        params = params.append('orderByDateAsc', 'true');
      } else if (filter.sort === 'DateAsc') {
        params = params.append('orderByDateDesc', 'true');
        params = params.append('orderByDateAsc', 'false');
      } else {
        params = params.append('orderByDateDesc', 'false');
        params = params.append('orderByDateAsc', 'false');
      }

      if (filter.categoryId != null) {
        params = params.append('categoryId', filter.categoryId);
      } else {
        params = params.append('categoryId', '0');
      }
    }

    return params;
  };

  navigateToRecipe = (id: number): void => {
    this.router.navigate([`recipe/details/${id}`]);
  };

  private setRecipeMainImg = (): void => {
    this.recipes.forEach((x) => {
      if (x.mainImageId != null) {
        this.filesService
          .getFileById(x.recipeId)
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

  submitFilterFormDesktop = (): void => {
    this.fetchRecipes();
  };

  private setMainImgSrc = (
    recipe: RecipeMainPageItemModel,
    file: File | Blob
  ): void => {
    let myReader: FileReader = new FileReader();

    myReader.onloadend = function (e) {
      recipe.mainImageSrc = myReader.result.toString();
    };
    myReader.readAsDataURL(file);
  };

  private setNotFound = (): void => {
    if (this.recipes.length <= 0) {
      this.noRecipes = true;
    } else {
      this.noRecipes = false;
    }
  };
}
