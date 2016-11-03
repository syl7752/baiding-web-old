import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {LiveService} from '../../shared/api/live/live.service';
import {LiveInfoModel} from '../../shared/api/live/live.model';
import {MqEvent, EventType} from "../../shared/mq/mq.service";
import {TimelineService} from '../../live-room/timeline/timeline.service';
import {LiveStatus} from "../../shared/api/live/live.enums";
import {WechatService} from "../../shared/wechat/wechat.service";
import {ModalService} from "../../shared/modal/modal.service";
import {InviteApiService} from "../../shared/api/invite/invite.api";
import {InvitationModel} from "../../shared/api/invite/invite.model";

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [InviteApiService],
})

export class SettingsComponent implements OnInit {
  liveId: string;
  liveInfo: LiveInfoModel;
  unreadCount = 0;
  liveStatusEnums = LiveStatus;
  invitations: InvitationModel[];

  constructor(private route: ActivatedRoute, private router: Router,
              private liveService: LiveService,
              private timelineService: TimelineService, private wechatService: WechatService,
              private modalService: ModalService,private inviteApiService: InviteApiService) {
  }

  ngOnInit() {
    this.liveId = this.route.parent.snapshot.params['id'];
    this.liveInfo = this.route.snapshot.data['liveInfo'];
    this.timelineService.startReceive(this.liveId);
    this.timelineService.onReceivedEvents(evt => this.onReceivedEventsReturn(evt));
    this.inviteApiService.getInvitations(this.liveId).then((res)=> {
      this.invitations = res;
    });
  }

  get audioAutoPlay() {
    return this.liveService.isAudioAutoPlay(this.liveId);
  }

  set audioAutoPlay(result: boolean) {
    this.liveService.toggleAudioAutoPlay(this.liveId);
  }

  get isAdmin() {
    return this.liveService.isAdmin(this.liveId);
  }

  onReceivedEventsReturn(evt: MqEvent) {
    if (evt.event === EventType.LiveMsgUpdate) {
      this.unreadCount++;
    }
  }

  backToMainScreen() {
    this.router.navigate(['/lives/' + this.liveId]);
  }

  goInvitation() {
    this.router.navigate([`/lives/${this.liveId}/vip-info`]);
  }

  closeWindow() {
    this.wechatService.closeWindow();
  }

  closeLive() {
    this.modalService.popup('确定结束直播吗?', '取消', '确定').then((result)=> {
      if (!result) return;
      this.liveService.closeLive(this.liveId);
      this.liveService.getLiveInfo(this.liveId, true).then(liveInfo => this.liveInfo = liveInfo);
    });
  }
}
