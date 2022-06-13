import { BehaviorSubject } from 'rxjs';
import { ModalAddTodoPage } from './../modal-add-todo/modal-add-todo.page';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('modal', { static: false }) modal?: ElementRef;

  secretData = null;
  currentModal = null;
  todoLabel: string;

  constructor(
    private authService: AuthService,
    public routerOutlet: IonRouterOutlet,
    public modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }

  getMe() {
    console.log('HomePage ~ getMe');
    this.secretData = null;

    this.authService.getMe().subscribe((res: any) => {
      console.log('HomePage ~ this.authService.getMe ~ res', res);
      this.secretData = res.msg;
    });
  }
  getTodos() {
    console.log('HomePage ~ getTodos');
    this.secretData = null;

    this.authService.getTodos().subscribe((res: any) => {
      console.log('HomePage ~ this.authService.getTodos ~ res', res);
      this.secretData = res.msg;
    });
  }

  async presentModal() {
    const mySubject = new BehaviorSubject(this.todoLabel);

    const modal = await this.modalCtrl.create({
      component: ModalAddTodoPage,
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
      handle: false,
      componentProps: {
        mySubject,
      },
    });
    await modal.present();

    mySubject.subscribe((value: string) => {
      console.log('HomePage ~ mySubject.subscribe ~ value', value);
      this.todoLabel = value;
      this.authService.postTodo({ label: this.todoLabel }).subscribe((res) => {
        console.log('HomePage ~ mySubject.subscribe ~ res', res);
      });
    });

    modal.onDidDismiss().then(() => {
      console.log('HomePage ~ modal.onDidDismiss');
      mySubject.unsubscribe();
    });
  }
}
