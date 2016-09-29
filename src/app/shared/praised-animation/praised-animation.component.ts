import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UserInfoService } from '../user-info/user-info.service';
import { UserAnimEmoji } from './praised-animation.model'

declare var _: any;

@Component({
  selector: 'praised-animation',
  templateUrl: './praised-animation.component.html',
  styleUrls: ['./praised-animation.component.scss'],
})

export class PraisedAnimationComponent implements OnInit {
  @Input() userAnim: UserAnimEmoji;
  randomAnimation: number;
  randomXAxisOffset: number;
  isMine: boolean;

  constructor(private sanitizer: DomSanitizer, private userInfoService: UserInfoService) {}

  ngOnInit() {
    this.randomAnimation = _.random(0, 1, false);
    this.randomXAxisOffset = _.random(10, 44, false);
    let userInfo = this.userInfoService.getUserInfoCache();
    this.isMine = this.userAnim.user.uid === userInfo.uid;
  }

  getXAxisOffset() {
    return this.sanitizer.bypassSecurityTrustStyle(this.randomXAxisOffset + 'px');
  }
}
