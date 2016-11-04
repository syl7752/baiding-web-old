import {Component, OnInit, Input, Output, EventEmitter, AfterViewChecked, OnDestroy} from '@angular/core';
import {LiveInfoModel} from '../../shared/api/live/live.model';
import {LiveService} from '../../shared/api/live/live.service';
import {LiveStatus} from '../../shared/api/live/live.enums';
import {UtilsService} from '../../shared/utils/utils';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'live-room-info',
  templateUrl: './live-room-info.component.html',
  styleUrls: ['./live-room-info.component.scss'],
})

export class LiveRoomInfoComponent implements OnInit,OnDestroy {
  @Input() liveInfo: LiveInfoModel;
  @Input() isShow: boolean;
  @Output() isShowChange = new EventEmitter<boolean>();
  timeNow = UtilsService.now.toString();
  timer: any;

  constructor(private liveService: LiveService, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.timer = setInterval(()=> {
      this.timeNow = UtilsService.now.toString();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  close() {
    this.isShowChange.emit(false);
  }

  toBeginnerGuide() {
    this.close();
    this.liveService.setLiveRoomAlreadyVisited();
  }

  get liveRoomStatusHumanize(): string {
    switch (this.liveInfo.status) {
      case LiveStatus.Created:
        return '倒计时';
      case LiveStatus.Started:
        return '直播中';
      case LiveStatus.Ended:
        return '直播结束';
      default:
        return '未知状态';
    }
  }

  get coverUrl(): SafeUrl {
    let coverUrl = this.liveInfo.coverUrl ? this.liveInfo.coverUrl : '/assets/img/liveroombanner-blur.jpg';
    return this.sanitizer.bypassSecurityTrustUrl(coverUrl);
  }
}
