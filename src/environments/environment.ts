// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const host = {
  self: 'http://www.zaojiu.fm',
  auth: 'http://auth.zaojiu.fm',
  io: 'http://io.zaojiu.fm',
  assets: 'http://www.zaojiu.fm',
  weinre: '',
};

export const appConfig = {
  host: host,
  name: '造就',
  slogan: '发现创造力',
  lcAppId: 'UGzbb42HlvESeNmziyhOWHsa-gzGzoHsz',
  lcAppKey: 'dbbAJuix9SThsVPWMkNSAQ9d',
  wechatLink: 'http://weixin.qq.com/r/OkOrs7fEwOq-rfPQ9xYo',
  payAddress: '/wxpay/',
  iosDownloadLink: 'https://a.app.qq.com/o/ioslink.jsp?id=1190044215',
  iosDownloadPage: 'https://www.zaojiu.com/app',
};

export const environment = {
  production: false,
  config: appConfig,
};
