import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { CreateRecipeModel } from 'src/app/infrastructure/models/createRecipe.model';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';
import { FilesService } from 'src/app/infrastructure/services/files.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { finalize } from 'rxjs/internal/operators/finalize';
import { ConfirmationService } from 'src/app/infrastructure/services/confirmation.service';
import { Location } from '@angular/common';
import { DomHelper } from 'src/app/infrastructure/helpers/dom-helper';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { EditRecipeModel } from 'src/app/infrastructure/models/edit-recipe.model';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css'],
})
export class CreateRecipeComponent implements OnInit {
  headerTitle: string = 'Dodaj przepis';

  cancelBtnLabel: string = 'Anuluj';

  saveAndPublicizeBtnLabel: string = 'Opublikuj';

  recipeForm: FormGroup;

  recipe: CreateRecipeModel;

  editRecipe: EditRecipeModel;

  isRecipeFormInvalid: boolean = false;

  isEdit: boolean = false;

  isDragging: boolean;

  dragCount: number = 0;

  imageSrc = '#';

  tinyInit: any = this.recipesService.getRecipeTinyInit();

  private recipeId: string;

  private recipeSubscription: Subscription;

  public categories: CategoryModel[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private recipesService: RecipesService,
    private filesService: FilesService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.recipeId = id;
        this.initEditRecipe(id);
      } else {
        this.initAddRecipe();
      }
    });

    this.fetchCategories();
  }

  private fetchCategories = (): void => {
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

  private initAddRecipe = (): void => {
    this.recipe = new CreateRecipeModel();
    this.initForm();
  };

  private initEditRecipe = (id: string): void => {
    this.editRecipe = new EditRecipeModel();
    this.isEdit = true;
    this.headerTitle = 'Edytuj przepis';
    this.fetchData(id);
  };

  private fetchData = (id: string): void => {
    this.loaderService.show();

    this.recipesService
      .getRecipeForUpdate(id)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          if (result) {
            this.setRecipeEdit(id, result);
            this.initForm();
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

  private setRecipeEdit = (id: string, updateModel: EditRecipeModel): void => {
    this.editRecipe = new EditRecipeModel();
    this.editRecipe.content = updateModel.content;
    this.editRecipe.title = updateModel.title;
    this.editRecipe.shortDescription = updateModel.shortDescription;
    this.editRecipe.mainImageId = updateModel.mainImageId;
    this.setRecipeMainImg(+this.recipeId);
  };

  private setRecipeMainImg = (id: number): void => {
    this.loaderService.show();
    this.filesService
      .getFileById(id)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.imageSrc = 'http://localhost:8000' + result.file;
        },
        (error) => {}
      );
  };

  private initForm = (): void => {
    let controls = {};

    controls['title'] = new FormControl(
      this.editRecipe && this.editRecipe.title ? this.editRecipe.title : '',
      Validators.required
    );

    controls['categoryId'] = new FormControl(
      this.editRecipe && this.editRecipe.categoryId
        ? this.editRecipe.categoryId
        : '1',
      Validators.required
    );

    controls['shortDescription'] = new FormControl(
      this.editRecipe && this.editRecipe.shortDescription
        ? this.editRecipe.shortDescription
        : '',
      Validators.required
    );

    controls['mainImg'] = new FormControl(
      '',
      this.editRecipe && this.editRecipe.mainImageId
        ? null
        : Validators.required
    );
    controls['content'] = new FormControl(
      this.editRecipe && this.editRecipe.content ? this.editRecipe.content : '',
      Validators.required
    );

    this.recipeForm = new FormGroup(controls);
  };

  /**
   * Cancel event handler.
   */
  onCancel = (): void => {
    this.confirmCancel();
  };

  /**
   * The method shows cancel confirmation dialog.
   */
  private confirmCancel = (): void => {
    this.confirmationService.createConfirmBase(
      'Anuluj',
      'Zmiany nie zostaną zapisane. Czy na pewno chcesz anulować?',
      'Tak',
      'Nie',
      () => {
        this.cancel();
      },
      () => {}
    );
  };

  private cancel = (): void => {
    this.location.back();
  };

  onSave = (): void => {
    this.confirmSave();
  };

  private confirmSave = (): void => {
    this.confirmationService.createConfirmBase(
      'Opublikuj',
      'Wpis zostanie zapisany i opublikowany. Czy chcesz opublikować?',
      'Tak',
      'Nie',
      () => {
        this.save();
      },
      () => {}
    );
  };

  private save = (): void => {
    this.validateForm();
    if (!this.isRecipeFormInvalid) {
      this.loaderService.show();
      this.updateRecipeModel();
      const action =
        this.isEdit == true
          ? this.recipesService.putRecipe(this.editRecipe, +this.recipeId)
          : this.recipesService.postRecipe(this.recipe);
      action
        .pipe(
          finalize(() => {
            this.loaderService.hide();
          })
        )
        .subscribe(
          (result) => {
            this.router.navigate(['../my-profile', { saveSuccess: true }]);
          },
          (error) => {}
        );
    }
  };

  private updateRecipeModel = (): void => {
    if (this.recipe != null) {
      this.recipe.title = this.titleControl.value;
      this.recipe.content = this.contentControl.value;
      this.recipe.categoryId = this.categoryIdControl.value;
      this.recipe.shortDescription = this.shortDescriptionControl.value;
    }

    if (this.editRecipe != null) {
      this.editRecipe.title = this.titleControl.value;
      this.editRecipe.content = this.contentControl.value;
      this.editRecipe.categoryId = this.categoryIdControl.value;
      this.editRecipe.shortDescription = this.shortDescriptionControl.value;
    }
  };

  onDragOver = (event): void => {
    event.preventDefault();
  };

  onDragEnter = (event): void => {
    event.preventDefault();
    this.dragCount++;
    this.isDragging = true;
  };

  onDragLeave = (event): void => {
    event.preventDefault();
    this.dragCount--;
    if (this.dragCount <= 0) {
      this.isDragging = false;
    }
  };

  onMainImageSelected = (event): void => {
    event.preventDefault();
    event.stopPropagation();

    if (this.isDragging) {
      this.imageFromDragging(event);
    } else {
      this.imageFromExplorer(event);
    }
  };

  private imageFromExplorer = (event): void => {
    const file = event.target.files[0];

    this.setMainImage(file);
  };

  private imageFromDragging = (event): void => {
    const fileList = event.target.files;

    const file = fileList[0];

    this.setMainImage(file);

    this.isDragging = false;
  };

  private setMainImage = (file: File): void => {
    this.uploadMainImage(file);
  };

  private setMainImgSrc = (file: File | Blob): void => {
    let myReader: FileReader = new FileReader();
    let self = this;
    myReader.onloadend = function (e) {
      self.imageSrc = myReader.result.toString();
    };
    myReader.readAsDataURL(file);
  };

  private uploadMainImage = (file: File): void => {
    this.loaderService.show();
    let data = new FormData();
    data.append('file', file);

    this.recipesService
      .postRecipeImage(data)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          if (this.recipe != null) {
            this.recipe.mainImageId = +result.id;
          }
          if (this.editRecipe != null) {
            this.editRecipe.mainImageId = +result.id;
          }

          this.setMainImgSrc(file);
        },
        (error) => {
          (<HTMLInputElement>document.getElementById('fileDropRef')).value =
            null;
        }
      );
  };

  private validateForm = (): void => {
    this.recipeForm.markAllAsTouched();
    this.isRecipeFormInvalid = this.recipeForm.invalid;
    if (this.isRecipeFormInvalid) {
      DomHelper.scrollToTop();
    }
  };

  get titleControl() {
    return this.recipeForm.get('title');
  }

  get isTitleInvalid() {
    return (
      this.titleControl.invalid &&
      this.titleControl.touched &&
      this.titleControl.errors &&
      this.titleControl.errors.required
    );
  }

  get shortDescriptionControl() {
    return this.recipeForm.get('shortDescription');
  }

  get isShortDescriptionInvalid() {
    return (
      this.shortDescriptionControl.invalid &&
      this.shortDescriptionControl.touched &&
      this.shortDescriptionControl.errors &&
      this.shortDescriptionControl.errors.required
    );
  }

  get mainImageControl() {
    return this.recipeForm.get('mainImg');
  }

  get isMainImageInvalid() {
    return this.mainImageControl.touched && this.imageSrc == '#';
  }

  get contentControl() {
    return this.recipeForm.get('content');
  }

  get isContentInvalid() {
    return (
      this.contentControl.invalid &&
      this.contentControl.touched &&
      this.contentControl.errors &&
      this.contentControl.errors.required
    );
  }

  get categoryIdControl() {
    return this.recipeForm.get('categoryId');
  }

  get isCategoryIdInvalid() {
    return (
      this.categoryIdControl.errors && this.categoryIdControl.errors.required
    );
  }
}
