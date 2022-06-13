import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAddTodoPage } from './modal-add-todo.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAddTodoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAddTodoPageRoutingModule {}
