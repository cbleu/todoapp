import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {

  transfor2m(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

  transform(value: any, groupByKey: string) {
    const groupedList: any[] = [];
    const groupedElements: any = {};

    value.forEach((obj: any) => {
      if (!(obj[groupByKey] in groupedElements)) {
        groupedElements[obj[groupByKey]] = [];
      }
      groupedElements[obj[groupByKey]].push(obj);
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
