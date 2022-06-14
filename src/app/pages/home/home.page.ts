import { BehaviorSubject, take, switchMap, combineLatest, forkJoin, combineLatestAll } from 'rxjs';
import { ModalAddTodoPage } from './../modal-add-todo/modal-add-todo.page';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class HomePage implements OnInit {
  @ViewChild('modal', { static: false }) modal?: ElementRef;
  @ViewChild(IonDatetime) datetime: IonDatetime;

  profilData = null;
  currentModal = null;
  selectedLabel: string = null;
  selectedId = null;
  selectedState = false;
  todoList: Array<any> = [];
  filtered: Array<any> = [];
  ranged: Array<any> = [];

  displayedList$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  startDate$: BehaviorSubject<string> = new BehaviorSubject(null);
  endDate$: BehaviorSubject<string> = new BehaviorSubject(null);
  searchStr$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(
    private authService: AuthService,
    public routerOutlet: IonRouterOutlet,
    public modalCtrl: ModalController
  ) {}

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

  ngOnInit() {
    this.authService.todoEvent$.subscribe((value) => {
      // console.log('HomePage ~ this.authService.todoEvent$.subscribe ~ value', value);
      this.authService
        .getTodos()
        .pipe(take(1))
        .subscribe((res: any) => {
          this.todoList = res.rows;
          this.displayedList$.next(res.rows);
          // this.filtered = this.todoList;
          console.log('HomePage ~ ngOnInit ~ this.authService.getTodos ~ this.todoList', this.todoList);
        });
    });

    const subsCombine = combineLatest({
      start: this.startDate$,
      end: this.endDate$,
      search: this.searchStr$,
    }).subscribe((combined) => {
      console.log('HomePage ~ combine ~ combined', combined);
      let ranged = [];
      let filtered = [];
      if (combined.start && combined.end) {
        console.log('HomePage ~ ngOnInit ~ combined.start && combined.end', combined.start, combined.end);
        // ranged = this.todoList.filter((item) => {
        //   return dayjs(item.updatedAt).isBetween(combined.start, combined.end, 'day');
        // });
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
        ranged = this.todoList;
      }
      console.log('HomePage ~ ngOnInit ~ ranged', ranged);
      if (combined.search) {
        // filtered = ranged.filter((item) => {
        //   console.log('onSearchChange ~ filtered item', item.label, item.label.includes(combined.search));
        //   return item.label.includes(combined.search);
        // });
        filtered = ranged.filter((item) => item.label.includes(combined.search));
        console.log('HomePage ~ ngOnInit ~ filtered', filtered);
        this.displayedList$.next(filtered);
      } else {
        console.log('HomePage ~ ngOnInit ~ no filtering !', ranged);
        this.displayedList$.next(ranged);
      }
    });

    // this.authService.todoEvent$.pipe(switchMap(this.authService.getTodos())).subscribe(() => { });
    //   this.authService.getTodos().subscribe((res: any) => {
    //     this.todoList = res.rows;
    //     this.filtered = this.todoList;
    //     console.log('HomePage ~ ngOnInit ~ this.authService.getTodos ~ this.todoList', this.todoList);
    //   });
    // });
  }

  getNow() {
    return dayjs().format('YYYY-MM-DD');
  }

  modalStartDateChanged(valueIn) {
    this.startDate$.next(valueIn);
    console.log('modalStartDateChanged ~ this.startDate$.value', this.startDate$.value);
    // this.filterTodos();
  }
  modalEndDateChanged(valueIn) {
    setTimeout(() => {
      this.endDate$.next(valueIn);
    });
    console.log('HomePage ~ modalEndDateChanged ~ this.endDate$.value', this.endDate$.value);
    // this.filterTodos();
  }

  // filterTodos() {
  //   if (this.formattedStartDate && this.formattedEndDate) {
  //     this.filtered = this.todoList.filter((item) => {
  //       return dayjs(item.updatedAt).isBetween(this.formattedStartDate, this.formattedEndDate, 'day');
  //     });
  //   } else {
  //     this.filtered = this.todoList;
  //   }
  //   console.log('HomePage ~ this.filtered=this.todoList.filter ~ this.filtered', this.filtered);
  // }

  async close() {
    await this.datetime.cancel(true);
  }

  async select() {
    await this.datetime.confirm(true);
  }

  onSearchChange(event) {
    console.log('onSearchChange ~ event', event.detail.value);
    this.searchStr$.next(event.detail.value);
    // this.filtered = this.filtered.filter((item) => {
    //   // console.log('onSearchChange ~ filtered item', ~item.label.indexOf(event.detail.value));
    //   console.log('onSearchChange ~ filtered item', item.label, item.label.includes(event.detail.value));
    //   return item.label.includes(event.detail.value);
    //   // return ~item.label.indexOf(event.detail.value);
    //   // return dayjs(item.updatedAt).isBetween(this.formattedStartDate, this.formattedEndDate, 'day');
    // });
  }

  logout() {
    this.authService.logout();
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

  async presentModal(label?: string) {
    const mySubject = new BehaviorSubject(label);

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
      console.warn('HomePage ~ mySubject.subscribe ~ value', value);
      if (value) {
        this.selectedLabel = value;
        if (this.selectedId) {
          this.authService
            .putTodo({ label: this.selectedLabel, done: this.selectedState }, this.selectedId)
            .subscribe((res) => {
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
    });
  }

  selectTodo(todo) {
    console.log('HomePage ~ todo', todo);
    this.selectedId = todo.id;
    this.presentModal(todo.label);
  }
}
