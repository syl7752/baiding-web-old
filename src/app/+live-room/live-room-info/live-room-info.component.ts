import {Component, OnInit, OnDestroy} from '@angular/core';
import {LiveInfoModel} from '../../shared/api/live/live.model';
import {Router, ActivatedRoute} from "@angular/router";
import {LiveService} from "../../shared/api/live/live.service";
import {UserInfoModel} from "../../shared/api/user-info/user-info.model";
import {ShareApiService} from '../../shared/api/share/share.api';
import {UserInfoService} from "../../shared/api/user-info/user-info.service";
import {OperationTipsService} from "../../shared/operation-tips/operation-tips.service";
import {UtilsService} from "../../shared/utils/utils";
import {IosBridgeService} from "../../shared/ios-bridge/ios-bridge.service";
import {PaidStatus} from "./live-room-info.enums";
import {InviteApiService} from "../../shared/api/invite/invite.api";
import {AudienceInvitationModel} from "../../shared/api/invite/invite.model";
import {PayBridge} from "../../shared/bridge/pay.interface";

@Component({
  templateUrl: './live-room-info.component.html',
  styleUrls: ['./live-room-info.component.scss'],
})

export class LiveRoomInfoComponent implements OnInit, OnDestroy {
  liveInfo: LiveInfoModel;
  userInfo: UserInfoModel;
  isQrcodeShown = false;
  qrcode: string;
  timer: any;
  paidShown = false;
  paidEnums = PaidStatus;
  paidStatus = PaidStatus.None;
  inApp = UtilsService.isInApp;
  liveId: string;
  audienceListInvitations: AudienceInvitationModel[];
  isInWechat = UtilsService.isInWechat;
  lockPayClick = false;
  isSubscribeLinkLoading = false;
  isSubscribeLinkError = false;
  booking = false;

  constructor(private router: Router, private route: ActivatedRoute, private liveService: LiveService,
              private userInfoService: UserInfoService, private operationTipsService: OperationTipsService,
              private iosBridgeService: IosBridgeService, private shareService: ShareApiService,
              private inviteApiService: InviteApiService, private payBridge: PayBridge) {
  }

  ngOnInit() {
    this.liveId = this.route.snapshot.params['id'];
    this.liveInfo = this.route.snapshot.data['liveInfo'];
    this.userInfo = this.route.snapshot.data['userInfo'];
    if (this.liveInfo.paid) this.paidStatus = PaidStatus.Completed;

    let payResult = this.route.snapshot.params['payResult'];
    if (payResult === 'success') {
      this.paidShown = true;
    }

    this.route.snapshot.data['shareTitle'] = `${this.userInfo.nick}邀请你参加#${this.liveInfo.subject}#直播分享`;
    this.route.snapshot.data['shareDesc'] = this.liveInfo.desc;
    this.route.snapshot.data['shareCover'] = this.liveInfo.coverThumbnailUrl;
    this.route.snapshot.data['shareLink'] = this.getShareUri();

    // this.shareService.accessSharedByRoute(this.route);

    this.inviteApiService.audienceListInvitations(this.liveId).then((res) => {
      this.audienceListInvitations = res;
    });

    this.getSubscribeLink();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  getShareUri(): string {
    let shareQuery = this.shareService.makeShareQuery('streams', this.liveInfo.id);
    let uriTree = this.router.createUrlTree([`/lives/${this.liveInfo.id}/info`], {queryParams: shareQuery});
    let path = this.router.serializeUrl(uriTree);
    return `${location.protocol}//${location.hostname}${path}`;
  }

  bookLive() {
    if (this.booking) return;

    this.booking = true;

    this.liveService.bookLive(this.liveInfo.id).then(liveInfo => {
      this.liveInfo = liveInfo;
      if (!this.userInfo.isSubscribed && !this.inApp) {
        this.showQrcode();
      } else if (!this.userInfo.isSubscribed && this.inApp) {
        this.showQrcode()
      } else if (this.userInfo.isSubscribed) {
        this.operationTipsService.popup('订阅成功');
      }
    }).finally(() => {
      this.booking = false;
    });
  }

  unbookLive() {
    if (this.booking) return;

    this.booking = true;

    this.liveService.unbookLive(this.liveInfo.id).then(liveInfo => {
      this.liveInfo = liveInfo;
      this.operationTipsService.popup('您已取消订阅');
    }).finally(() => {
      this.booking = false;
    });
  }

  payLive() {
    if (this.lockPayClick) return;

    this.lockPayClick = true;

    this.payBridge.pay(this.liveId).then(result => {
      this.paidStatus = this.paidEnums.Completed;
      this.liveService.getLiveInfo(this.liveId, true);
      this.paidShown = true;
    }, (reason) => {
      if (reason === 'cancel') {
        this.paidStatus = this.paidEnums.None;
        this.paidShown = false;
      } else {
        if (reason === 'timeout') {
          this.operationTipsService.popup("支付超时，请重新支付");
        } else if (reason === 'weixin_js_bridge_not_found') {
          this.operationTipsService.popup("微信支付初始化失败，请刷新页面重试");
        }

        this.paidStatus = this.paidEnums.Failure;
        this.paidShown = true;
      }
    }).finally(() => {
      this.lockPayClick = false
    });
  }

  gotoLive() {
    this.router.navigate([`/lives/${this.liveInfo.id}`]);
  }

  showQrcode() {
    this.isQrcodeShown = true;

    // 轮询用户是否已订阅公众号
    this.timer = setInterval(() => {
      this.userInfoService.getUserInfo(true).then((userInfo) => {
        if (userInfo.isSubscribed) {
          this.closeQrcode();
          this.operationTipsService.popup('订阅成功');
        }
        this.userInfo = userInfo;
      });
    }, 3 * 1000);
  }

  closeQrcode() {
    this.isQrcodeShown = false;
    this.paidShown = false;
    clearInterval(this.timer);
  }


  copyToClipboard(text: string) {
    this.iosBridgeService.copyText(text).then(() => {
      this.operationTipsService.popup('复制成功');
      this.closeQrcode();
    });
  }

  getSubscribeLink(): Promise<void> {
    if (this.isSubscribeLinkLoading) return;

    this.isSubscribeLinkLoading = true;
    this.isSubscribeLinkError = false;

    return this.liveService.getSubscribeLink(this.liveId).then(link => {
      this.qrcode = link;
      return;
    }).catch((err) => {
      this.isSubscribeLinkError = true;
      throw err;
    }).finally(() => {
      this.isSubscribeLinkLoading = false;
    });
  }

  gotoShareStar() {
    this.router.navigate([`/lives/${this.liveInfo.id}/share-star`]);
  }
}
