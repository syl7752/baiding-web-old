import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

import { MessageModel } from './message/message.model';
import { TimelineService } from './timeline.service';
import { UserInfoService } from '../../shared/user-info/user-info.service';
import { UserInfoModel } from '../../shared/user-info/user-info.model';
import { LiveService } from '../../shared/live/live.service';
import { LiveInfoModel } from '../../shared/live/live.model';
import { MqService, MqPraisedUser, MqEvent, EventType } from '../../shared/mq/mq.service';
import { MessageApiService } from "../../shared/api/message.api";

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})

export class TimelineComponent implements OnInit, OnDestroy {
  id: string;
  liveInfo: LiveInfoModel;
  userInfo: UserInfoModel;
  messages: MessageModel[] = [];
  receviedReplySubscription: Subscription;
  scrollSubscription: Subscription;
  timelineSubscription: Subscription;
  isOnLatest: boolean;
  isOnNewest: boolean;
  isLoading: boolean;
  countdownTimer: any;

  constructor(private route: ActivatedRoute, private timelineService: TimelineService,
    private userInfoService: UserInfoService, private liveService: LiveService,
    private messageApiService: MessageApiService) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    let userInfoPromise = this.userInfoService.getUserInfo();
    let liveInfoPromise = this.liveService.getLiveInfo(this.id);

    // TODO reject ??
    Promise.all([userInfoPromise, liveInfoPromise]).then(result => {
      let userInfo = result[0];
      let liveInfo = result[1];
      this.userInfo = userInfo;
      this.liveInfo = liveInfo;
      this.countdownTimer = setInterval(()=>{
        this.liveInfo.expectStartAt = this.liveInfo.expectStartAt.indexOf('.00') === -1 ? this.liveInfo.expectStartAt + '.00' : this.liveInfo.expectStartAt.replace('.00', '')
      }, 60000);

      this.timelineService.startReceive(this.id);
      this.timelineService.onReceivedEvents(evt => {
        this.onReceivedEvents(evt)
      })
      this.timelineService.onReceivedPraises(prised => {
        this.onReceivedPraises(prised)
      })

      // this.gotoLastestMessages();
      setTimeout(() => this.timelineService.scrollToBottom(), 200);
      this.startObserveTimelineScroll();
      this.startObserveTimelineAction();
      this.startReceiveReply();

      this.gotoLatestMessages()
    });
  }

  ngOnDestroy() {
    this.timelineService.stopReceive(this.id)
    this.stopObserveTimelineScroll();
    this.timelineSubscription.unsubscribe();
    clearInterval(this.countdownTimer)
  }

  isStarted(): boolean {
    let expectStartAt = moment(this.liveInfo.expectStartAt)
    let isZero = expectStartAt.isSame(moment('0001-01-01T00:00:00Z'))
    return moment().isSameOrAfter(expectStartAt) || isZero
  }

  isClosed(): boolean{
    let closedAt = moment(this.liveInfo.closedAt)
    let isZero = closedAt.isSame(moment('0001-01-01T00:00:00Z'))
    return moment().isSameOrAfter(closedAt) && !isZero
}

  onReceivedEvents(evt: MqEvent) {
    switch (evt.event) {
      case EventType.LiveMsgUpdate:
        this.gotoLatestMessages()
        break
      case EventType.LivePraise:
        // TODO
        break
      case EventType.LiveClosed:
        this.liveService.getLiveInfo(this.id, true).then((result) => {
          this.liveInfo = result
        })
        break
    }
  }

  onReceivedPraises(praisedUser: MqPraisedUser) {
    if (praisedUser.user.uid == this.userInfo.uid) return

    for (let idx in this.messages) {
      let message = this.messages[idx]
      if (message.id == praisedUser.msgId) {
        message.pushPraisedUser(praisedUser.user)
      }
    }
  }

  gotoLatestMessages() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.messageApiService.listMessages(this.id).then(messages => {
      messages = messages.reverse();
      this.messages = messages;
      this.isOnNewest = false;
      this.isOnLatest = true;
      this.isLoading = false;
    });
  }

  gotoFirstMessages() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.messageApiService.listMessages(this.id, '', 20, ['createdAt']).then(messages => {
      this.messages = messages;
      this.isOnNewest = true;
      this.isOnLatest = false;
      this.isLoading = false;
    });
  }

  getNextMessages(marker: string, limit: number, sorts: string[]) {
    if (this.isLoading) return;

    this.isLoading = true;

    this.messageApiService.listMessages(this.id, marker, limit, sorts).then(messages => {
      for (let message of messages) {
        this.messages.push(message);
      }

      if (messages.length === 0) {
        this.isOnLatest = true;
      }

      this.isLoading = false;
    });
  }

  getPrevMessages(marker: string, limit: number, sorts: string[]) {
    if (this.isLoading) return;

    this.isLoading = true;

    this.messageApiService.listMessages(this.id, marker, limit, sorts).then(messages => {
      for (let message of messages) {
        this.messages.unshift(message);
      }

      if (messages.length === 0) {
        this.isOnNewest = true;
      }

      this.isLoading = false;
    });
  }

  startObserveTimelineScroll() {
    this.scrollSubscription = this.timelineService.scroller$.subscribe(
      topOrBottom => {
        if (topOrBottom) {
          if (this.messages.length === 0) return;
          let firstMessage = this.messages[0];
          this.getPrevMessages(`$lt${firstMessage.createdAt}`, 20, ['-createdAt']);
        } else {
          if (this.messages.length === 0) return;
          let lastMessage = this.messages[this.messages.length - 1];
          this.getNextMessages(`$gt${lastMessage.createdAt}`, 20, ['createdAt']);
        }
      }
    );
  }

  stopObserveTimelineScroll() {
    this.scrollSubscription.unsubscribe();
  }

  startObserveTimelineAction() {
    this.timelineSubscription = this.timelineService.timeline$.subscribe(
      topOrBottom => {
        this.stopObserveTimelineScroll();

        if (topOrBottom) {
          this.gotoFirstMessages();
          setTimeout(() => {
            this.timelineService.scrollToTop();
            this.startObserveTimelineScroll();
          }, 200);
        } else {
          this.gotoLatestMessages();
          setTimeout(() => {
            this.timelineService.scrollToBottom();
            this.startObserveTimelineScroll();
          }, 200);
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
}