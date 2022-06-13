import { GroupByDayPipe } from "./group-by-day.pipe";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GroupByPipe } from './group-by.pipe';
import { GroupByMonthPipe } from './group-by-month.pipe';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [GroupByPipe, GroupByDayPipe,GroupByMonthPipe],
  exports: [GroupByPipe, GroupByDayPipe, GroupByMonthPipe],
  providers: [GroupByPipe, GroupByDayPipe, GroupByMonthPipe],
})
export class PipesModule {}
