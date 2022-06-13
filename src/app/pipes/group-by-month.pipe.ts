import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import 'dayjs/locale/fr';

@Pipe({
  name: 'groupByMonth'
})
export class GroupByMonthPipe implements PipeTransform {

  transform(value: any) {
    dayjs.locale('fr');
    const groupByKey = 'udatedAt';
    const groupedList: any[] = [];
    const groupedElements: any = {};

    value.forEach((obj: any) => {
      const formatedObj = dayjs(obj[groupByKey]).format('MMMM YYYY');
      console.log('GroupByMonthPipe ~ value.forEach ~ formatedObj', formatedObj);
      if (!(formatedObj in groupedElements)) {
        groupedElements[formatedObj] = [];
      }
      groupedElements[formatedObj].push(obj);
    });

    for (let prop in groupedElements) {
      if (groupedElements.hasOwnProperty(prop)) {
        groupedList.push({
          key: prop,
          list: groupedElements[prop]
        });
      }
    }
    console.log('GroupByPipe ~ transform ~ groupedList', groupedList);

    return groupedList;
  }

}
