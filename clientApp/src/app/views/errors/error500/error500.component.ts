import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Inject,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { CommentModel } from 'src/app/infrastructure/models/comment.model';
import { CreateCommentModel } from 'src/app/infrastructure/models/create-comment.model';
import { GetRecipeModel } from 'src/app/infrastructure/models/get-recipe.model';
import { ViewRecipeModel } from 'src/app/infrastructure/models/view-recipe.model';
import { AuthService } from 'src/app/infrastructure/services/auth.service';
import { FilesService } from 'src/app/infrastructure/services/files.service';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';

@Component({
  selector: 'app-error500',
  templateUrl: './error500.component.html',
  styleUrls: ['./error500.component.css'],
})
export class Error500Component implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
