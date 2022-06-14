import { BehaviorSubject, take, switchMap, combineLatest, forkJoin, combineLatestAll, Subscription, skip } from 'rxjs';
import { ModalAddTodoPage } from './../modal-add-todo/modal-add-todo.page';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, IonRouterOutlet, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('modal', { static: false }) modal?: ElementRef;
  @ViewChild(IonDatetime) datetime: IonDatetime;

  profilData = null;
  currentModal = null;
  selectedLabel: string = null;
  selectedId = null;
  selectedState = false;

  // Todo original & displayed lists
  todoList: Array<any> = [];
  displayedList$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);

  // List manipulator !
  startDate$: BehaviorSubject<string> = new BehaviorSubject(null);
  endDate$: BehaviorSubject<string> = new BehaviorSubject(null);
  searchStr$: BehaviorSubject<string> = new BehaviorSubject(null);

  subsCombine: Subscription;
  subsTodos: Subscription;

  constructor(
    private authService: AuthService,
    public routerOutlet: IonRouterOutlet,
    public modalCtrl: ModalController
  ) {}

  ngOnDestroy(): void {
    this.subsCombine.unsubscribe();
    this.subsTodos.unsubscribe();
  }

  // Helpers
  get startDate() {
    if (this.startDate$.value) {
      return dayjs(this.startDate$.value).format('YYYY-MM-DD');
    }
    return;
  }
  get endDate() {
    if (this.endDate$.value) {
      return dayjs(this.endDate$.value).format('YYYY-MM-DD');
    }
    return;
  }
  getNow() {
    return dayjs().format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.subsTodos = this.authService.todoEvent$.subscribe((value) => {
      this.authService
        .getTodos()
        .pipe(take(1))
        .subscribe((res: any) => {
          this.todoList = res.rows;
          this.displayedList$.next(res.rows);
          console.log('HomePage ~ ngOnInit ~ this.authService.getTodos ~ this.todoList', this.todoList);
        });
    });

    this.subsCombine = combineLatest({
      start: this.startDate$,
      end: this.endDate$,
      search: this.searchStr$,
    }).subscribe((combined) => {
      console.log('HomePage ~ combineLatest (filtering)', combined);
      let ranged = []; // restrictions sur les dates
      let filtered = []; // restrictions sur le label

      if (combined.start && combined.end) {
        console.log('HomePage ~ ngOnInit ~ combined.start && combined.end', combined.start, combined.end);
        ranged = this.todoList.filter((item) =>
          dayjs(item.updatedAt).isBetween(combined.start, combined.end, 'day', '[]')
        );
      } else if (combined.start) {
        console.log('HomePage ~ ngOnInit ~ combined.start', combined.start);
        ranged = this.todoList.filter((item) => dayjs(item.updatedAt).isSameOrAfter(combined.start, 'day'));
      } else if (combined.end) {
        console.log('HomePage ~ ngOnInit ~ combined.end', combined.end);
        ranged = this.todoList.filter((item) => dayjs(item.updatedAt).isSameOrBefore(combined.end, 'day'));
      } else {
        // ranged aura dans tous les cas la liste selon la restriction de date à partid d'ici
        ranged = this.todoList;
      }
      // On applique ensuite la restriction de label sur la liste ranged
      console.log('HomePage ~ ngOnInit ~ ranged', ranged);
      if (combined.search) {
        filtered = ranged.filter((item) => item.label.includes(combined.search));
        console.log('HomePage ~ ngOnInit ~ filtered', filtered);
        this.displayedList$.next(filtered);
      } else {
        this.displayedList$.next(ranged);
      }
    });
  }

  modalStartDateChanged(valueIn) {
    setTimeout(() => this.startDate$.next(valueIn)); // ugly patch pour corriger ExpressionChangedAfterItHasBeenCheckedError
    console.log('modalStartDateChanged ~ this.startDate$.value', this.startDate$.value);
  }
  modalEndDateChanged(valueIn) {
    setTimeout(() => this.endDate$.next(valueIn));
    console.log('HomePage ~ modalEndDateChanged ~ this.endDate$.value', this.endDate$.value);
  }

  async closePicker() {
    await this.datetime.cancel(true);
  }

  async confirmPicker() {
    await this.datetime.confirm(true);
  }

  onSearchChange(event) {
    console.log('onSearchChange ~ event', event.detail.value);
    this.searchStr$.next(event.detail.value);
  }

  logout() {
    // this.authService.logout();
    this.authService.fakeLogout();
  }

  getMe() {
    console.log('HomePage ~ getMe');
    this.profilData = null;

    this.authService.getMe().subscribe((res: any) => {
      console.log('HomePage ~ this.authService.getMe ~ res', res);
      this.profilData = res.msg;
    });
  }

  deleteTodo(slidingItem, todo) {
    console.log('HomePage ~ deleteTodo', todo.id);
    // Close the item
    slidingItem.close();
    // Delete the todo
    this.authService
      .deleteTodo(todo.id)
      .pipe(take(1))
      .subscribe((res: any) => {
        console.log('HomePage ~ .deleteTodo ~ res', res);
      });
  }

  selectTodo(todo) {
    console.log('HomePage ~ selectTodo todo', todo);
    this.selectedId = todo.id;
    this.presentModal(todo);
  }

  async presentModal(todo?) {
    const mySubject = new BehaviorSubject(todo.label);
    const checkSubject = new BehaviorSubject(todo.done);

    const modal = await this.modalCtrl.create({
      component: ModalAddTodoPage,
      breakpoints: [0.7, 1],
      initialBreakpoint: 0.7,
      handle: false,
      cssClass: 'modal-todo',
      componentProps: {
        mySubject,
        checkSubject,
      },
    });
    await modal.present();

    // On s'abonne au contenu de la modal en passant la valeur initiale
    mySubject.pipe(skip(1)).subscribe((value: string) => {
      console.warn('HomePage ~ mySubject.subscribe ~ value', value);
      if (value) {
        this.selectedLabel = value;
        if (this.selectedId) {
          this.authService.putTodo({ label: value, done: checkSubject.value }, this.selectedId).subscribe((res) => {
            console.log('HomePage ~ putTodo ~ res', res);
          });
        } else {
          this.authService.postTodo({ label: this.selectedLabel }).subscribe((res) => {
            console.log('HomePage ~ postTodo ~ res', res);
          });
        }
      }
    });

    modal.onDidDismiss().then(() => {
      console.log('HomePage ~ modal.onDidDismiss');
      mySubject.unsubscribe();
      this.selectedId = undefined;
      this.selectedLabel = undefined;
    });
  }
}
