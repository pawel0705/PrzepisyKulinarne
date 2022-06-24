import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterGuard } from '../../infrastructure/guards/register.guard';
import { RegisterComponent } from '../auth/register/register.component';
import { LoginComponent } from '../auth/login/login.component';

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Rejestracja',
      breadcrumbs: 'Rejestracja',
    },
    canActivate: [RegisterGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Logowanie',
      breadcrumbs: 'Logowanie',
    },
    canActivate: [RegisterGuard],
  },
  {
    path: '',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
