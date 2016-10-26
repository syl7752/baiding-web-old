import {Component, OnInit, OnDestroy, OnChanges, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router, NavigationStart} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {LiveService} from '../shared/api/live/live.service';
import {LiveInfoModel} from '../shared/api/live/live.model';
import {TitleService} from '../shared/title/title.service';
import {WechatService} from '../shared/wechat/wechat.service';
import {UserInfoService} from '../shared/api/user-info/user-info.service';
import {UserInfoModel} from '../shared/api/user-info/user-info.model';

@Component({
  templateUrl: './live-room.component.html',
  styleUrls: ['./live-room.component.scss'],
})

export class LiveRoomComponent implements OnInit, OnDestroy {
  id: string;
  liveInfo: LiveInfoModel;
  userInfo: UserInfoModel;
  showInfo: boolean;
  isChildrenActived: boolean;
  routerSubscription: Subscription;
  isCommentOpened: boolean = true;
  urlRegex = new RegExp('^\/lives\/.*?\/(push-comment|post|history|invitation)$');
  refreshInterval: any;
  isBeginnerGuideShow: boolean;

  constructor(private route: ActivatedRoute, private router: Router, private liveService: LiveService,
              private titleService: TitleService, private wechatService: WechatService, private userInfoService: UserInfoService) {
  }

  toShowBeginnerGuide(result: boolean) {
    this.isBeginnerGuideShow = result;
  }

  isEditor() {
    return this.liveService.isEditor(this.id);
  }

  isAudience() {
    return this.liveService.isAudience(this.id);
  }

  getShareUri(): string {
    let uriTree = this.router.createUrlTree([`/lives/${this.id}`, {source: 'share'}]);
    let hash = this.router.serializeUrl(uriTree);
    let uri = location.href.replace(location.hash, `#${hash}`);
    return uri;
  }

  getLiveInfo(needRefresh?: boolean) {
    this.liveService.getLiveInfo(this.id, needRefresh).then(liveInfo => {

      let oldInfo = this.liveInfo;
      this.liveInfo = liveInfo;
      if (oldInfo) {
        this.liveInfo.praisedAnimations = oldInfo.praisedAnimations;
      }

      this.resetLiveRoom();
    });
  }

  resetLiveRoom() {
    this.titleService.set(this.liveInfo.subject);
    this.wechatService.share(this.liveInfo.subject, this.liveInfo.desc, this.liveInfo.coverUrl, this.getShareUri(), this.id);
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    if (!this.liveService.getLiveRoomAlreadyVisited()) {
      let fromShare = this.route.snapshot.params['source'] === 'share';
      this.showInfo = fromShare;
      if (!fromShare) {
        this.isBeginnerGuideShow = true;
        this.liveService.setLiveRoomAlreadyVisited();
      }
    }

    // 监控router变化，如果route换了，那么设置 isChildrenActived
    // 此属性会控制父底栏是否显示，以免子弹出层的底栏和父窗口底栏同时显示，导致跑版
    this.isChildrenActived = this.urlRegex.test(this.router.url);
    this.routerSubscription = this.router.events.subscribe(
      event => {
        if (event instanceof NavigationStart) {
          this.isChildrenActived = this.urlRegex.test(event.url);
        }
      }
    );

    this.liveInfo = this.route.snapshot.data['liveInfo'];
    this.resetLiveRoom();
    this.userInfo = this.userInfoService.getUserInfoCache();

    this.refreshInterval = setInterval(() => {
      this.getLiveInfo(true);
    }, 10 * 1000);
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();

    clearInterval(this.refreshInterval);
  }
}
