import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

moment.locale('zh-cn');

@Pipe({name: 'timeFormater'})
export class TimeFormaterPipe implements PipeTransform {
  transform(time: string, format: string): string {
    var timeParsed = moment(+time / 1e6);
    if (!timeParsed.isValid()) timeParsed = moment(time);
    if (!timeParsed.isValid()) return '无效时间';
    return timeParsed.format(format);
  }
}

@Pipe({name: 'durationFormater'})
export class DurationFormaterPipe implements PipeTransform {
  transform(time: string, index: number): string {
    var timeParsed = moment(+time / 1e6);
    if (!timeParsed.isValid()) timeParsed = moment(time);
    if (!timeParsed.isValid()) return '无效时间';

    let sec = Math.round(timeParsed.diff(moment()) / 1000);

    if (sec <= 0) return '0';

    let h = Math.floor(sec/(24*60*60));
    let m = Math.floor(sec%(24*60*60)/(60 * 60));
    let s = Math.floor(sec%(24*60*60)%(60 * 60)/60);

    if (index === 0) return h.toString();
    if (index === 1) return m.toString();
    if (index === 2) return s.toString();

    return  '无效时间'
  }
}

@Pipe({name: 'fromNow'})
export class FromNowPipe implements PipeTransform {
  transform(time: string): string {
    return moment(+time / 1e6).fromNow();
  }
}
