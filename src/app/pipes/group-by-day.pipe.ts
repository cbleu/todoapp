import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

@Pipe({
  name: 'groupByDay'
})
export class GroupByDayPipe implements PipeTransform {

  transfor2m(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

  transform(value: any) {
    const groupByKey = 'udatedAt';
    const groupedList: any[] = [];
    const groupedElements: any = {};

    value.forEach((obj: any) => {
      const formatedObj = dayjs(obj[groupByKey]).format('DD/MM/YYYY');
      console.log('GroupByDayPipe ~ value.forEach ~ formatedObj', formatedObj);
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
