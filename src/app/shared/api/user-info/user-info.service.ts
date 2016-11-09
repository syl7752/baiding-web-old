import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { AppConfig } from '../../../app.config'
import {UserInfoModel, PermissionModel} from './user-info.model';
import { StoreService } from '../../store/store.service';


@Injectable()
export class UserInfoService {
  private userInfoUrl: string;

  constructor (private http: Http, private config: AppConfig, private store: StoreService) {
    this.userInfoUrl = `${config.urlPrefix.io}/api/user`;
  }

  goWechatAuth() {
    location.href = `${this.config.urlPrefix.auth}/oauth2/wechat/redirect?to=${encodeURIComponent(window.location.href)}`;
  }

  getUserInfoCache(): UserInfoModel {
    return this.store.get('userinfo') as UserInfoModel;
  }

  parseUserInfo(data: any): UserInfoModel {
    let info = new UserInfoModel();
    info.nick = data.nick;
    info.avatar = data.avatar;
    info.uid = data.uid;
    info.permissions = new PermissionModel;
    info.permissions.publish = false;

    if (data.permissions && data.permissions.publish) {
      info.permissions.publish = true;
    }

    return info;

  }

  getUserInfo(needWechatAuth?: boolean, needRefresh?: boolean): Promise<UserInfoModel> {
    let userInfoCache = this.store.get('userinfo') as UserInfoModel;
    if ( userInfoCache && !needRefresh ) { return Promise.resolve(userInfoCache); }

    return this.http.get(this.userInfoUrl).toPromise()
      .then(res => {
        let data = res.json();
        let userInfo = this.parseUserInfo(data);
        this.store.set('userinfo', userInfo);
        return userInfo;
      })
      .catch(res => {
        if (+res.status === 401) {
          if (needWechatAuth) {
            this.goWechatAuth();
          } else {
            // TODO: pc auth;
          }
        } else {
          // TODO: error;
        }
        return Promise.reject(res);
      });
  }
}
