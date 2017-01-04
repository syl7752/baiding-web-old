import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {WechatConfigModel} from './wechat.model';
import {environment} from "../../../environments/environment";
import {OperationTipsService} from "../operation-tips/operation-tips.service";
import {UtilsService} from "../utils/utils";

declare var wx: any;

@Injectable()
export class WechatConfigService {
  onVoicePlayEnd: () => void;
  autoCompleteResolver: (localId: string) => void;
  autoCompleteRejecter: (reason: string) => void;
  hasInit: boolean;

  constructor(private http: Http, private operationService: OperationTipsService) {}

  private getConfig(): Promise<WechatConfigModel> {
    return this.http.post(`${environment.config.host.io}/api/wechat/signature/config`, null).toPromise()
      .then(res => {
        return res.json() as WechatConfigModel;
      })
  }

  private configWechat() {
    this.getConfig().then(config => {
      config.jsApiList = [
        'startRecord',
        'stopRecord',
        'onVoiceRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'onVoicePlayEnd',
        'uploadVoice',
        'downloadVoice',
        'translateVoice',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'chooseImage',
        'uploadImage',
      ];

      config.debug = false;

      console.log('wechat config: ', config);

      wx.config(config);
    });
  }

  init(): Promise<void> {
    if (this.hasInit) return Promise.resolve();

    let hasConfig = false;

    wx.error(reason => {
      console.log('wx err:', reason);

      if (hasConfig) {
        this.operationService.popup('微信初始化失败,请刷新页面');
        return;
      }

      hasConfig = true;

      this.configWechat();
    });

    return new Promise<void>((resolve, reject) => {
      wx.ready(() => {
        this.hasInit = true;

        console.log('wechat ready');

        wx.onVoiceRecordEnd({
          // 录音时间超过一分钟没有停止的时候会执行 complete 回调
          complete: (res) => {
            console.log(this.autoCompleteResolver, res.localId, 'had auto complete');
            if (this.autoCompleteResolver) this.autoCompleteResolver(res.localId);
          },
          fail: (reason) => {
            if (this.autoCompleteRejecter) this.autoCompleteRejecter(reason);
          }
        });

        wx.onVoicePlayEnd({
          success: res => {
            if (this.onVoicePlayEnd) this.onVoicePlayEnd();
          }
        });

        resolve();
      });

      this.configWechat();
    });
  }

  closeWindow() {
    wx.closeWindow();
  }
}
