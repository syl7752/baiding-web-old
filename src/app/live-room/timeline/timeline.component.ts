import {
  Component, OnInit, OnDestroy, Input, ViewChild, ViewChildren, QueryList
} from '@angular/core';
import {Subscription}   from 'rxjs/Subscription';
import {ActivatedRoute, Router} from '@angular/router';

import {MessageModel} from '../../shared/api/message/message.model';
import {MessageType} from '../../shared/api/message/message.enum';
import {TimelineService} from './timeline.service';
import {UserInfoModel} from '../../shared/api/user-info/user-info.model';
import {LiveService} from '../../shared/api/live/live.service';
import {LiveInfoModel} from '../../shared/api/live/live.model';
import {LiveStatus} from '../../shared/api/live/live.enums';
import {MqPraisedUser, MqEvent, EventType} from '../../shared/mq/mq.service';
import {MessageApiService} from "../../shared/api/message/message.api";
import {ScrollerDirective} from "../../shared/scroller/scroller.directive";
import {ScrollerEventModel} from "../../shared/scroller/scroller.model";
import {ScrollerPosition} from "../../shared/scroller/scroller.enums";
import {UserAnimEmoji} from '../../shared/praised-animation/praised-animation.model';
import {UtilsService} from '../../shared/utils/utils';

import {MessageComponent} from './message/message.component';
@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent implements OnInit, OnDestroy {
  id: string;
  timeNow = UtilsService.now.toString();
  @Input() liveInfo: LiveInfoModel;
  @Input() userInfo: UserInfoModel;
  @ViewChild(ScrollerDirective) scroller: ScrollerDirective;
  messages: MessageModel[] = [];
  receviedReplySubscription: Subscription;
  timelineSubscription: Subscription;
  isOnOldest: boolean;
  isOnLatest: boolean;
  isOnBottom: boolean;
  isLoading: boolean;
  countdownTimer: any;
  unreadCount = 0;

  @ViewChildren('messagesComponents') messagesComponents: QueryList<MessageComponent>;

  constructor(private route: ActivatedRoute, private router: Router, private timelineService: TimelineService,
              private liveService: LiveService, private messageApiService: MessageApiService) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    if (!this.isStarted()) {
      this.countdownTimer = setInterval(() => {
        let startedAt = this.liveInfo.expectStartAt.indexOf('.00') === -1 ? `${this.liveInfo.expectStartAt}.00` : this.liveInfo.expectStartAt.replace('.00', '');
        this.liveInfo.expectStartAt = startedAt;
      }, 60000);
    }

    this.timelineService.startReceive(this.id);
    this.timelineService.onReceivedEvents(evt => this.onReceivedEvents(evt));
    this.timelineService.onReceivedPraises(prised => this.onReceivedPraises(prised));
    this.timelineService.onReceiveMessages(message => this.onReceiveMessages(message));

    this.startObserveTimelineAction();
    this.startReceiveReply();
    this.gotoLatestMessages().then(result => {
      setTimeout(() => {
        this.scroller.scrollToBottom();
      }, 0);
    });
  }

  ngOnDestroy() {
    this.timelineService.stopReceive(this.id);
    this.timelineSubscription.unsubscribe();
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

  }

  private findNextAudioTypeMessage(msgId: string): MessageModel {
    let i = 0;

    for (; i < this.messages.length; i++) {
      if (this.messages[i].id === msgId) {
        break;
      }
    }

    for (i++; i < this.messages.length; i++) {
      if (this.messages[i].type === MessageType.Audio) {
        return this.messages[i];
      }
    }

    return null;
  }

  private findMessageComponent(msgId: string): MessageComponent {
    let components = this.messagesComponents.toArray();

    for (let component of components) {
      if (component.message.id === msgId) {
        return component;
      }
    }

    return null;
  }

  audioPlayEnded(msg: MessageModel) {
    if (!this.liveService.isAudioAutoPlay(this.liveInfo.id)) {
      return;
    }

    let nextAudioMessage = this.findNextAudioTypeMessage(msg.id);
    if (!nextAudioMessage) {
      return;
    }
    let comp = this.findMessageComponent(nextAudioMessage.id);
    if (comp) {
      comp.playAudio();
    }
  }

  isStarted(): boolean {
    return this.liveInfo.status == LiveStatus.Started;
  }

  isClosed(): boolean {
    return this.liveInfo.status == LiveStatus.Ended;
  }

  onReceivedEvents(evt: MqEvent) {
    switch (evt.event) {
      case EventType.LiveMsgUpdate:
        if (this.isOnBottom) {
          this.gotoLatestMessages().then(() => {
            setTimeout(() => {
              this.scroller.scrollToBottom();
            }, 0);
          });
        } else {
          this.unreadCount++;
          this.isOnLatest = false;
        }
        break;
      case EventType.LiveClosed:
        this.liveService.getLiveInfo(this.id, true).then((result) => {
          this.liveInfo = result
        });
        break;
    }
  }

  onReceivedPraises(praisedUser: MqPraisedUser) {
    if (praisedUser.user.uid == this.userInfo.uid) {
      return
    }
    for (let idx in this.messages) {
      let message = this.messages[idx];
      if (message.id == praisedUser.msgId) {
        let userAnim = new UserAnimEmoji;
        userAnim.user = praisedUser.user;
        message.pushPraisedUser(userAnim, praisedUser.praised, praisedUser.num)
      }
    }
  }

  onReceiveMessages(message: MessageModel) {
    for (let idx in this.messages) {
      if (this.messages[idx].id == message.id) {
        return
      }
    }

    let isOnBottom = this.isOnBottom;

    this.messages.push(message);

    if (isOnBottom) {
      setTimeout(() => {
        this.scroller.scrollToBottom();
      }, 0);
    }
  }

  gotoLatestMessages(): Promise<boolean> {
    if (this.isLoading) return Promise.resolve(false);

    this.isLoading = true;

    return this.messageApiService.listMessages(this.id).then(messages => {
      messages = messages.reverse();
      this.messages = messages;
      this.isOnOldest = false;
      this.isOnLatest = true;
      this.isOnBottom = true;
      this.unreadCount = 0;
      this.isLoading = false;
      return true;
    });
  }

  gotoOldestMessages(): Promise<boolean> {
    if (this.isLoading) return Promise.resolve(false);

    this.isLoading = true;

    return this.messageApiService.listMessages(this.id, '', 20, ['createdAt']).then(messages => {
      this.messages = messages;
      this.isOnOldest = true;
      this.isOnLatest = false;
      this.isOnBottom = false;
      this.isLoading = false;
      return true;
    });
  }

  getNextMessages(marker: string, limit: number, sorts: string[]) {
    if (this.isLoading) return;

    this.isLoading = true;

    this.messageApiService.listMessages(this.id, marker, limit, sorts).then(messages => {
      this.removeRepeat(messages);
      for (let message of messages) {
        this.messages.push(message);
      }

      if (messages.length === 0) {
        this.isOnLatest = true;
        this.unreadCount = 0;
      }

      this.isLoading = false;
    });
  }

  getPrevMessages(marker: string, limit: number, sorts: string[]) {
    if (this.isLoading) return;

    this.isLoading = true;

    this.messageApiService.listMessages(this.id, marker, limit, sorts).then(messages => {
      this.removeRepeat(messages);
      for (let message of messages) {
        this.messages.unshift(message);
      }

      if (messages.length === 0) {
        this.isOnOldest = true;
      }

      this.isLoading = false;
    });
  }

  onScroll(e: ScrollerEventModel) {
    if (e.position == ScrollerPosition.OnTop) {
      if (this.messages.length === 0) return;
      let firstMessage = this.messages[0];
      this.getPrevMessages(`$lt${firstMessage.createdAt}`, 20, ['-createdAt']);
    } else if (e.position == ScrollerPosition.OnBottom) {
      if (this.messages.length === 0) return;
      let lastMessage = this.messages[this.messages.length - 1];
      this.getNextMessages(`$gt${lastMessage.createdAt}`, 20, ['createdAt']);
    }

    this.isOnBottom = e.position === ScrollerPosition.OnBottom;

    this.timelineService.onScroll(e);
  }

  startObserveTimelineAction() {
    this.timelineSubscription = this.timelineService.timeline$.subscribe(
      oldestOrLatest => {
        this.scroller.stopEmitScrollEvent();

        if (oldestOrLatest) {
          this.gotoOldestMessages().then(result => {
            if (result) {
              setTimeout(() => {
                this.scroller.scrollToTop();

                // 等待滚动完毕
                setTimeout(() => {
                  this.scroller.startEmitScrollEvent();
                }, 0);
              }, 0);
            }
          });
        } else {
          this.gotoLatestMessages().then(result => {
            if (result) {
              setTimeout(() => {
                this.scroller.scrollToBottom();

                // 等待滚动完毕
                setTimeout(() => {
                  this.scroller.startEmitScrollEvent();
                }, 0);
              }, 0);
            }
          });
        }
      }
    );
  }

  startReceiveReply() {
    this.receviedReplySubscription = this.timelineService.receivedReply$.subscribe(
      reply => {
        for (let message of this.messages) {
          if (message.id === reply.parentId) {
            message.replies.push(reply)
          }
        }
      }
    );
  }

  removeRepeat(messages: MessageModel[]) {
    if (!messages || !messages.length) return;

    let idsX = {};
    for (let idx in this.messages) {
      idsX[this.messages[idx].id] = idx
    }
    let idY = {};
    let idxs = [];
    for (let message of messages) {
      idY[message.id] = true;
      if (idsX[message.id] !== undefined) {
        idxs.push(idsX[message.id])
      }
    }
    idxs = idxs.sort().reverse();
    for (let idx of idxs) {
      this.messages.splice(idx, 1)
    }
  }

  gotoHistory() {
    this.router.navigate([`/lives/${this.id}/history`]);
  }

  triggerGotoLatest() {
    this.timelineService.gotoLastMessage();
  }
}
