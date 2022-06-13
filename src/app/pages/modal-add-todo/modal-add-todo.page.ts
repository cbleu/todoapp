import { ModalController } from "@ionic/angular";
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-add-todo',
  templateUrl: './modal-add-todo.page.html',
  styleUrls: ['./modal-add-todo.page.scss'],
})
export class ModalAddTodoPage implements OnInit {
  todoForm;
  todoLabel = '';
  @Input() mySubject: BehaviorSubject<string>;

  constructor(private fb: FormBuilder, private modalCtrl: ModalController) {}

  // ionViewWillLeave() {
  //   console.log('ModalAddTodoPage ~ ionViewWillLeave ~ this.todoForm.value.label', this.todoForm.value.label);
  //   this.mySubject.next(this.todoForm.value.label);
  // }

  ngOnInit() {
    const preselect = this.mySubject.value;
    console.log('ModalAddTodoPage ~ ngOnInit ~ preselect', preselect);

    this.todoForm = this.fb.group({
      label: [preselect, Validators.required],
    });
  }

  sendForm() {
    console.log('ModalAddTodoPage ~ sendForm ~ this.todoForm.value.label', this.todoForm.value.label);
    this.mySubject.next(this.todoForm.value.label);
    this.modalCtrl.dismiss();

  }
}
