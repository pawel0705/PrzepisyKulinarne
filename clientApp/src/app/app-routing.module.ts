import { NgModule } from '@angular/core';
import { Routes, RouterModule, Route, Router } from '@angular/router';
import { AboutComponent } from './views/about/about.component';
import { Error404Component } from './views/errors/error404/error404.component';
import { Error500Component } from './views/errors/error500/error500.component';
import { HomeComponent } from './views/home/home.component';
import { CreateRecipeComponent } from './views/recipes/create-recipe/create-recipe.component';
import { RecipeComponent } from './views/recipes/recipe/recipe.component';
import { MyProfileComponent } from './views/user/my-profile/my-profile.component';
import { UserProfileComponent } from './views/user/user-profile/user-profile.component';

const routes: Route[] = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      title: 'Strona główna',
      breadcrumbs: 'Strona główna',
    },
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {
      title: 'O nas',
      breadcrumbs: 'O nas',
    },
  },
  {
    path: 'my-profile',
    component: MyProfileComponent,
    data: {
      title: 'Mój profil',
      breadcrumbs: 'Mój profil',
    },
  },
  {
    path: 'user-profile/:id',
    component: UserProfileComponent,
    data: {
      title: 'Profil użytkownika',
      breadcrumbs: 'Profil użytkownika',
    },
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./views/auth/auth.module').then((m) => m.AuthModule),
    data: {
      title: 'Logowanie i rejestracja',
      breadcrumbs: null,
    },
  },
  {
    path: 'recipe/details/:id',
    component: RecipeComponent,
    data: {
      title: 'Przepis kulinarny',
    },
  },
  {
    path: 'recipe/create-recipe',
    component: CreateRecipeComponent,
    data: {
      title: 'Utwórz przepis',
    },
  },
  {
    path: 'recipe/create-recipe/:id',
    component: CreateRecipeComponent,
    data: {
      title: 'Edytuj przepis',
    },
  },
  {
    path: '404',
    component: Error404Component,
    data: {
      title: '404',
    },
  },
  {
    path: '500',
    component: Error500Component,
    data: {
      title: '500',
    },
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private router: Router) {
    this.router.errorHandler = (error: any) => {
      this.router.navigate(['404']);
    };
  }
}
