// For vendors for example jQuery, Lodash, angular2-jwt just import them here unless you plan on
// chunking vendors files for async loading. You would need to import the async loaded vendors
// at the entry point of the async loaded file. Also see custom-typings.d.ts as you also need to
// run `typings install x` where `x` is your module

// Angular 2
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/forms';
import '@angular/http';
import '@angular/router';

// AngularClass
import '@angularclass/webpack-toolkit';
import '@angularclass/request-idle-callback';

// RxJS
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
require('leancloud-realtime');
require('leancloud-push');
require('inobounce');
require("moment-countdown");
// fix moment-countdown declaration
declare module 'moment' {
  interface Moment {
    countdown(end: any, units: any, max: number, digits: number): any;
  }
}

(<any>window).wx = require('weixin-js-sdk')

import * as FastClick from 'fastclick';
FastClick['attach'](document.body);

if ('production' === ENV) {
  // Production

} else {
  // Development
  require('angular2-hmr');

}
