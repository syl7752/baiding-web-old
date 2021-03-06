import {host} from "../../env/environment";
import {Position} from "vue-router/types/router";
import {LiveInfoModel} from "../api/lives.model";

declare const DocumentTouch: any;

export const hasMouseEvent = ('onmousedown' in document);
export const isInWechat = /micromessenger/i.test(navigator.userAgent);
export const isiOS = /iPhone|iPad/i.test(navigator.userAgent);
export const isInApp = /zaojiuliveapp/i.test(navigator.userAgent);
export const isTouchable = (<any>window).DocumentTouch && document instanceof DocumentTouch;
export const isAndroid = /Android/i.test(navigator.userAgent);
export const isOnLargeScreen = matchMedia && matchMedia('(min-width: 1024px)').matches;
export const isChrome = /Chrome/i.test(navigator.userAgent);
export const isWindowsWechat = /WindowsWechat/i.test(navigator.userAgent);
export const isInWeiBo = /weibo/i.test(navigator.userAgent);
export const now = (): number => Math.floor((new Date()).getTime() / 1000);
export const isViewportLandscape = (): boolean => {
  // 检测设备是否为横屏
  return window.matchMedia && matchMedia('(orientation: landscape)').matches;
};
export const regexpEmail = /^[a-z0-9_]+(\.?[a-z0-9-_])*?@([a-zA-Z0-9]([a-zA-Z0-9\-]*?[a-zA-Z0-9])?\.)+[a-zA-Z]{2,20}$/i;
export const regexpUsername = /^[a-z][a-z0-9-]{3,18}[a-z0-9]$/;
export const regexpMobile = /^1[0-9]{10}$/;
export const regexpPhone = /^((086-)?0[0-9]{2,3}-[0-9]{7,8}\;)*((086-)?0[0-9]{2,3}-[0-9]{7,8})$/;
export const regexpPhoneOrMobile = /(^((086-)?0[0-9]{2,3}-[0-9]{7,8}\;)*((086-)?0[0-9]{2,3}-[0-9]{7,8})$)||(^(13\d|14[57]|15[^4,\D]|17[13678]|18\d)\d{8}|170[^346,\D]\d{7})$/;

export const parseAt = (content: string, needHeightLight = false): string => {
  const patt = /(@.+?)(\((.+?)\)){1}/g;
  let result = null;
  let _content = content;

  while ((result = patt.exec(content)) != null) {
    if (needHeightLight) {
      _content = _content.replace(result[0], `<span class="highlight">${result[1]}</span>`)
    } else {
      _content = _content.replace(result[0], result[1]);
    }
  }

  return _content;
};

export const resetWindowScroll = (): void => {
  setTimeout(() => document.body.scrollTop = document.body.scrollHeight, 800);
};

export const params = (obj: any, encode = true): string => {
  const params: string[] = [];
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (`${v}` !== 'undefined') {
      if (encode) {
        params.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      } else {
        params.push(`${k}=${v}`);
      }
    }
  });
  if (params.length) { return params.join('&'); }
  return '';
};

export const serializeObj = (source: string): { [key: string]: string } => {
  const kvArr = source.split('&');
  const target: { [key: string]: string } = {};
  for (let kv of kvArr) {
    const kvPair = kv.split('=');
    if (kvPair.length === 2) { target[decodeURIComponent(kvPair[0])] = decodeURIComponent(kvPair[1]); }
  }
  return target;
};

export class UrlModel {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: {[key: string]: string};
  hash: string;

  constructor(protocol: string, host: string, hostname: string, port: string, pathname: string, search: {[key: string]: string}, hash: string) {
    this.protocol = protocol;
    this.host = host;
    this.hostname = hostname;
    this.port = port;
    this.pathname = pathname;
    this.search = search;
    this.hash = hash;
  }

  toString(): string {
    const searchStr = params(this.search, false);
    return `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}${this.pathname}${searchStr ? '?' + searchStr : ''}${this.hash}`;
  }
}

export const parseUrl = (url: string): UrlModel => {
  const aEle = document.createElement('a');
  aEle.href = url;
  const queryStr = aEle.search.replace('?', '');
  const queryArr = queryStr ? queryStr.split('&') : [];
  const queryObj: {[key: string]: string} = {};
  queryArr.forEach(function(kv) {
    const kvArr = kv.split('=');
    queryObj[kvArr[0]] = kvArr[1];
  });
  return new UrlModel(aEle.protocol, aEle.host, aEle.hostname, aEle.port, aEle.pathname, queryObj, aEle.hash);
};

// 从字典库中随机生成特定位数的字符串
export const randomId = (size = 10, dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string => {
  const dictArr = dict.split('');
  let str = '';
  for (let i = 0; i < size; i++) {
    str += dictArr[Math.floor(Math.random() * dictArr.length)];
  }
  return str;
};

export const absUrl = (path: string, query?: {[key: string]: string}): string => {
  let url = `${location.protocol}//${location.hostname}${path}`;
  if (query) { url += `?${params(query)}`; }
  return url;
};

export const getRelativePath = (path: string, defaultPath: string): string => {
  let _path = path || defaultPath;
  _path = _path.replace(host.self, '');
  if (_path === '/' || !_.startsWith(_path,'/')) { _path = defaultPath; }
  return _path;
};

export class Money {
  value: number;
  ratioToYuan = 100;

  constructor(value: number, ratioToYuan = 100) {
    this.value = value;
    this.ratioToYuan = ratioToYuan;
  }

  toYuan(prefix = '￥', subfix = '', seperator = true, float = 2) {
    const yuan = this.value / this.ratioToYuan;
    let yuanString = yuan.toFixed(float);

    if (seperator) {
      const yuanArr = yuanString.split('.');
      const int = yuanArr[0];
      yuanArr[0] = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      yuanString = yuanArr.join('.');
    }

    if (prefix) { yuanString = `${prefix}${yuanString}`; }
    if (subfix) { yuanString = `${yuanString}${subfix}`; }

    return yuanString;
  }
}

export const removeHTML = (htmlStr: string): string => {
  return htmlStr.replace(/<(?:.|\n)*?>/gm, '');
};

export let scrollPosition: Position | { selector: string, offset?: Position } | void;

export const setScrollPosition = (selector?: string, x?: number, y?: number) => {
  if (selector) {
    scrollPosition = {selector};
  } else if (x && y) {
    scrollPosition = {x, y};
  }
  setTimeout(() => scrollPosition = undefined);
};

export const parsePercent = (percent: number): number => {
  if (percent > 1) percent = 1;
  if (percent < 0) percent = 0;

  return parseFloat(percent.toFixed(2));
};

export const readCookie = (name: string): string => {
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return '';
};

export const transformTime = (durationSecond: number, index: number): string => {
  let fixDigest = (num: string) => {
    if (num.length === 1) return `0${num}`;
    return num;
  };

  if (durationSecond <= 0) return '00';

  // 适用格式 天：小时：分：秒
  let d = Math.floor(durationSecond / (24 * 60 * 60));
  let h = Math.floor(durationSecond % (24 * 60 * 60) / (60 * 60));
  let m = Math.floor(durationSecond % (24 * 60 * 60) % (60 * 60) / 60);
  let s = Math.floor(durationSecond % (24 * 60 * 60) % (60 * 60) % 60);

  if (index === 1) return d ? fixDigest(d.toString()) : '';
  if (index === 2) return fixDigest(h.toString());
  if (index === 3) return fixDigest(m.toString());
  if (index === 4) return fixDigest(s.toString());

  // 适用格式 小时：分：秒
  let _h = Math.floor(durationSecond / (60 * 60));
  let _m = Math.floor(durationSecond % (60 * 60) / 60);
  let _s = Math.floor(durationSecond % (60 * 60) % 60);

  if (index === 5) return fixDigest(_h.toString());
  if (index === 6) return fixDigest(_m.toString());
  if (index === 7) return fixDigest(_s.toString());

  return '无效时间';
};

export const praseLiveTime = (liveInfo: LiveInfoModel): string => {
  let timePrased = '';

  if (liveInfo.isCreated) {
    let dayStr = moment(liveInfo.expectStartAt).calendar(moment(), {
      sameDay: '[今天] HH:mm:ss',
      nextDay: '[明天] HH:mm:ss',
      nextWeek: 'YYYY-MM-DD HH:mm:ss',
      lastDay: 'YYYY-MM-DD HH:mm:ss',
      lastWeek: 'YYYY-MM-DD HH:mm:ss',
      sameElse: 'YYYY-MM-DD HH:mm:ss'
    });

    timePrased = `将于 ${dayStr} 开始`;
  } else if (liveInfo.isStarted) {
    let diffSec = moment(new Date().getTime()).diff(moment(liveInfo.expectStartAt)) / 1000;
    let dayStr = transformTime(diffSec, 1);
    timePrased = `已进行 ${dayStr}天${transformTime(diffSec, 2)}小时${transformTime(diffSec, 3)}分${transformTime(diffSec, 4)}秒`;
  } else if (liveInfo.isClosed) {
    timePrased = `已于 ${moment(liveInfo.closedAt).format('YYYY-MM-DD HH:mm:ss')} 结束`;
  } else {
    timePrased = '未知状态';
  }

  return timePrased;
};
