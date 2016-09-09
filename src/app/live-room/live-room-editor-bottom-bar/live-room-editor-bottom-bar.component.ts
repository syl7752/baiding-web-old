import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';

import { BottomPopupSelectorService } from '../../shared/bottom-popup-selector/bottom-popup-selector.service';
import { BottomPopupSelectorModel } from '../../shared/bottom-popup-selector/bottom-popup-selector.model';
import { LiveRoomTimelineService } from '../live-room-timeline/live-room-timeline.service';
import { LiveService } from '../../shared/live/live.service';
import { WechatService } from '../../shared/wechat/wechat.service';
import { PostCommentService } from '../../shared/comment/post-comment.service';
import { SharePopupService } from '../../shared/share-popup/share-popup.service';


@Component({
  selector: 'live-room-editor-bottom-bar',
  templateUrl: './live-room-editor-bottom-bar.component.html',
  styleUrls: ['./live-room-editor-bottom-bar.component.scss'],
  providers: [ PostCommentService ]
})

export class LiveRoomEditorBottomBarComponent implements OnInit, OnDestroy {
  @Input() liveId: string;
  @Input() isOnNewest: boolean;
  @Input() isOnLatest: boolean;
  popupSelectorSubscription: Subscription;
  closeSelectorSubscription: Subscription;
  recordSubscription: Subscription;
  isRecording: boolean;
  isCanceled: boolean;
  isTooShort: boolean;
  timer: any;
  recordDuration: number;
  minRecordDuration = 10;

  constructor(private route: ActivatedRoute, private router: Router,
    private bottomPopupService: BottomPopupSelectorService, private liveRoomTimelineService: LiveRoomTimelineService,
    private liveService: LiveService, private wechatService: WechatService,
    private titleService: Title, private postCommentService: PostCommentService,
    private sharePopupService: SharePopupService) {}

  ngOnInit() {
    this.recordSubscription = this.wechatService.record$.subscribe(audioModel => {
      this.postCommentService.postAudioComment(this.liveId, audioModel.localId, audioModel.serverId, audioModel.translateResult)
    });
  }

  ngOnDestroy() {
    if (this.popupSelectorSubscription) this.popupSelectorSubscription.unsubscribe();
    if (this.closeSelectorSubscription) this.closeSelectorSubscription.unsubscribe();
    if (this.recordSubscription) this.recordSubscription.unsubscribe();
  }

  gotoPushDanmu() {
    this.router.navigate([`/lives/${this.liveId}/push-danmu`]);
  }

  gotoPostComment() {
    this.router.navigate([`/lives/${this.liveId}/post-comment`]);
  }

  gotoInvitation() {
    this.router.navigate([`/lives/${this.liveId}/invitation`]);
  }

  popupShare() {
    this.sharePopupService.popup()
  }

  popupBottomSelector() {
    if (this.bottomPopupService.isClosed) {
      const model = new BottomPopupSelectorModel();
      model.items = [];

      if (!this.isOnNewest) model.items.push('回到开始');
      if (!this.isOnLatest) model.items.push('查看最新');
      model.items.push('邀请嘉宾');
      model.items.push('结束直播');
      model.hasBottomBar = false;

      this.bottomPopupService.popup(model);

      this.popupSelectorSubscription = this.bottomPopupService.itemSelected$.subscribe(
        item => {
          if (item === '回到开始') return this.liveRoomTimelineService.gotoFirstComment();
          if (item === '查看最新') return this.liveRoomTimelineService.gotoLastComment();
          if (item === '邀请嘉宾') return this.gotoInvitation()
          if (item === '结束直播') return this.liveService.closeLive(this.liveId);
        }
      );

      // 关闭的时候取消掉上面的监听
      this.closeSelectorSubscription = this.bottomPopupService.needClose$.subscribe(
        () => {
          this.popupSelectorSubscription.unsubscribe();
          this.closeSelectorSubscription.unsubscribe();
        }
      );
    } else {
      this.bottomPopupService.close();
    }
  }

  startRecord() {
    if (this.isRecording) return

    this.isRecording = true
    this.isCanceled = false
    this.isTooShort = false

    this.recordDuration = 0
    this.timer = setInterval(() => {
      this.recordDuration++
    }, 100)

    this.wechatService.startRecord()
  }

  stopRecord() {
    if (!this.isRecording || this.isCanceled || this.isTooShort) return

    if (this.recordDuration < this.minRecordDuration) {
      this.isTooShort = true
      this.wechatService.cancelRecord()

      clearInterval(this.timer)

      this.timer = setTimeout(() => {
        this.isRecording = false
        clearTimeout(this.timer)
      }, 1000)
    } else {
      this.isRecording = false
      this.wechatService.stopRecord()
    }
  }

  cancelRecord() {
    if (!this.isRecording || this.isCanceled || this.isTooShort) return

    this.isCanceled = true

    clearInterval(this.timer)

    this.timer = setTimeout(() => {
      this.isRecording = false
      clearTimeout(this.timer)
    }, 1000)

    this.wechatService.cancelRecord()
  }
}
