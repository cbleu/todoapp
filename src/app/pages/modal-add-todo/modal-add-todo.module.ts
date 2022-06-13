import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from '@ionic/angular';

import { ModalAddTodoPageRoutingModule } from './modal-add-todo-routing.module';

import { ModalAddTodoPage } from './modal-add-todo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ModalAddTodoPageRoutingModule
  ],
  declarations: [ModalAddTodoPage]
})
export class ModalAddTodoPageModule {}
