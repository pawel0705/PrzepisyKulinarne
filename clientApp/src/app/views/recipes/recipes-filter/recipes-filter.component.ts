import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';

declare var $: any;

@Component({
  selector: 'app-recipes-filter',
  templateUrl: './recipes-filter.component.html',
  styleUrls: ['./recipes-filter.component.css'],
})
export class RecipesFilterComponent implements OnInit {
  @Output() onFilterFormSubmit: EventEmitter<void> = new EventEmitter<void>();

  public categories: CategoryModel[] = [];

  filterForm: FormGroup;

  searchKeyWordsLabel: string = 'Wyszukiwana fraza';

  searchCategoryLabel: string = 'Kategoria';

  orderByDateDescLabel: string = ' Najstarsze';

  orderByDateAscLabel: string = ' Najnowsze';

  btnSearchLabel: string = 'Szukaj';

  btnCleanLabel: string = 'Wyczyść';

  filterOpenedFlag: boolean = false;

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    this.init();
  }

  private init = (): void => {
    this.initForm();
    this.fetchCategories();
  };

  private fetchCategories = (): void => {
    this.recipesService
      .getRecipeCategories()
      .pipe(
        finalize(() => {
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
  }

  private initForm = (): void => {
    let controls = {};

    controls['title'] = new FormControl('');

    controls['categoryId'] = new FormControl(null);

    controls['sort'] = new FormControl('');

    this.filterForm = new FormGroup(controls);
  };

  onFilterArrowClick = (): void => {
    var content = document.getElementById('FilterArrow');
    if (!this.filterOpenedFlag) {
      content.style.transform = 'rotate(' + -180 + 'deg)';
    } else {
      content.style.transform = 'rotate(' + 0 + 'deg)';
    }

    this.filterOpenedFlag = !this.filterOpenedFlag;

    (<any>$('#collapseFilter')).collapse('toggle');
  };

  onClearFilters = (): void => {
    this.filterForm.reset();
  };

  onFilterSubmit = (): void => {
    this.onFilterFormSubmit.emit();
  };

  getActiveFilters = (): any => {
    return this.filterForm.value;
  };
}
