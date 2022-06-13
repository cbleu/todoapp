import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'lost-password',
    loadChildren: () => import('./pages/lost-password/lost-password.module').then((m) => m.LostPasswordPageModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'detail',
    loadChildren: () => import('./pages/detail/detail.module').then((m) => m.DetailPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'modal-add-todo',
    loadChildren: () => import('./pages/modal-add-todo/modal-add-todo.module').then( m => m.ModalAddTodoPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
