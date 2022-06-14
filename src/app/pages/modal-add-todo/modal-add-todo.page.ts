import { ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-add-todo',
  templateUrl: './modal-add-todo.page.html',
  styleUrls: ['./modal-add-todo.page.scss'],
})
export class ModalAddTodoPage implements OnInit {
  @Input() mySubject: BehaviorSubject<string>;
  @Input() checkSubject: BehaviorSubject<boolean>;

  todoForm;

  constructor(private fb: FormBuilder, private modalCtrl: ModalController) {}

  ngOnInit() {
    const preselect = this.mySubject.value;
    const isDone = this.checkSubject.value;

    this.todoForm = this.fb.group({
      label: [preselect, Validators.required],
      done: [isDone],
    });
  }
  onCheckTodo(value) {
    console.log('ModalAddTodoPage ~ value', value);
    }

  sendForm() {
    console.log('ModalAddTodoPage ~ sendForm ~ this.todoForm.value', this.todoForm.value);
    this.checkSubject.next(this.todoForm.value.done);
    this.mySubject.next(this.todoForm.value.label);
    this.closeModal();
  }
  closeModal() {
    this.modalCtrl.dismiss();
  }
}
