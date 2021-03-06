import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router} from "@angular/router";

import {LiveInfoModel} from '../../shared/api/live/live.model';
import {LiveService} from '../../shared/api/live/live.service';
import {UserInfoModel} from '../../shared/api/user-info/user-info.model';
import {UserAnimEmoji} from '../../shared/praised-animation/praised-animation.model';
import {EditMode} from "../../shared/comment-input/comment-input.enums";
import {OperationTipsService} from "../../shared/operation-tips/operation-tips.service";
import {TimelineService} from "../timeline/timeline.service";
import {CommentModel} from "../../shared/api/comment/comment.model";
import {CommentService} from "../comment/comment.service";
import {UserInfoService} from "../../shared/api/user-info/user-info.service";

@Component({
  selector: 'audience-tool-bar',
  templateUrl: './audience-tool-bar.component.html',
  styleUrls: ['./audience-tool-bar.component.scss'],
})

export class AudienceToolBarComponent implements OnInit, OnDestroy {
  @Input() liveId: string;
  @Input() liveInfo: LiveInfoModel;
  @Input() userInfo: UserInfoModel;
  commentContent = '';
  modeEnums = EditMode;
  mode = EditMode.None;
  isPraisePosting: boolean;
  private receviedAvatarTouchedSub: Subscription;

  constructor(private liveService: LiveService, private timelineService: TimelineService,
              private router: Router, private tipsService: OperationTipsService,
              private commentService: CommentService) {
  }

  ngOnInit() {
    //监听点击用户头像事件
    this.receviedAvatarTouchedSub = this.timelineService.avatarTouched$.subscribe((userTouched)=> {
      this.commentContent = `@${userTouched.nick}(${userTouched.uid}) `;
      this.mode = EditMode.Text;
    });
  }

  ngOnDestroy() {
    if (this.receviedAvatarTouchedSub) this.receviedAvatarTouchedSub.unsubscribe();
  }

  confirmPraise(emoji: string) {
    if (this.userInfo) {
      let userAnim = new UserAnimEmoji;
      userAnim.user = this.userInfo;
      userAnim.emoji = emoji;
      this.liveInfo.praisedAnimations.push(userAnim);

      if (this.isPraisePosting) return;

      this.isPraisePosting = true;
      this.liveInfo.hadPraised = true;
      this.liveInfo.praised += 1;

      this.liveService.praiseLive(this.liveInfo.id, this.liveInfo.hadPraised, emoji).finally(() => {
        this.isPraisePosting = false;
      });
    } else {
      this.toLogin();
    }
    return;
  }

  postSuccessful(comment: CommentModel) {
    this.commentService.pushComment(comment);
    this.tipsService.popup('评论成功');
  }

  goSettings() {
    if (this.userInfo) {
      this.router.navigate([`lives/${this.liveId}/settings`]);
    } else {
      this.toLogin();
    }
  }

  toLogin () {
    this.router.navigate(['/signin'], {queryParams: {redirectTo: location.href}});
  }
}
