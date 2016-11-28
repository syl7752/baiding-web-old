import {NgModule} from '@angular/core';
import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from '@angular/platform-browser';
import {ReactiveFormsModule, FormsModule}   from '@angular/forms';

import {ROUTES} from './live-room.route';
import {LiveRoomComponent} from './live-room.component';
import {CommentComponent} from './comment/comment.component';
import {AudienceToolBarComponent} from './audience-tool-bar/audience-tool-bar.component';
import {TimelineComponent} from './timeline/timeline.component';
import {MessageComponent} from './timeline/message/message.component';
import {PostComponent} from './post/post.component';
import {PraisedAnimationDirective} from '../shared/praised-animation/praised-animation.directive';
import {PraisedAnimationComponent} from '../shared/praised-animation/praised-animation.component';
import {LiveInfoResolver} from '../shared/guard/live-info.resolver';
import {TimelineService} from './timeline/timeline.service';
import {UserInfoCardService} from './user-info-card/user-info-card.service';
import {CommentService} from './comment/comment.service';
import {MessageApiService} from "../shared/api/message/message.api";
import {QuitEditGuard} from '../shared/guard/quit-edit.guard';
import {PipeModule} from "../shared/pipe/pipe.module";
import {UploadApiService} from "../shared/api/upload/upload.api";
import {LoadingModule} from "../shared/bd-loading/bd-loading.module";
import {AudioPlayerModule} from "../shared/audio-player/audio-player.module";
import {ImageViewerModule} from "../shared/image-viewer/image-viewer.module";
import {LiveRoomInfoComponent} from "./live-room-info/live-room-info.component";
import {BeginnerGuideComponent} from "./beginner-guide/beginner-guide.component";
import {TopBarComponent} from "./top-bar/top-bar.component";
import {TopBarSwitchBtnModule} from "../shared/topbar-switch-btn/topbar-switch-btn.module";
import {SwitchBtnModule} from "../shared/switch-btn/switch-btn.module";
import {ToolTipsModule} from "../shared/tooltips/tooltips.module";
import {AnimationModule} from "../shared/animation/animation.module";
import {MessageService} from "./timeline/message/message.service";
import {AutoBlurModule} from "../shared/auto-blur/auto-blur.module";
import {EditorToolBarComponent} from "./editor-tool-bar/editor-tool-bar.component";
import {UserInfoCardComponent} from "./user-info-card/user-info-card.component";
import {RecorderComponent} from "./editor-tool-bar/recorder/recorder.component";
import {CommentApiService} from "../shared/api/comment/comment.service";
import {FileSelectorModule} from "../shared/file-selector/file-selector.module";
import {ScrollerModule} from "../shared/scroller/scroller.module";
import {AudioPlayerService} from "../shared/audio-player/audio-player.service";
import {LiveRoomInfoUpperModule} from "../shared/live-room-info-upper/live-room-info-upper.module";
import {EmptyModule} from "../shared/empty/empty.module";
<<<<<<< 7314fccee30cb04e9169ba7611d6ed13410804d7
import {HammerInstance} from "@angular/platform-browser/src/dom/events/hammer_gestures";

export class MessageHammerConfig extends HammerGestureConfig  {
  buildHammer(element: HTMLElement): HammerInstance {
    let mc = new Hammer(element, {domEvents: true});
    mc.get('press').set({ time: 500 });
    return mc;
  }
}
=======
import {UtilsService} from "../shared/utils/utils";
>>>>>>> fix beginner guide & rm angular2-localstorage & etc

@NgModule({
  imports: [
    ROUTES,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    LoadingModule,
    AudioPlayerModule,
    ImageViewerModule,
    SwitchBtnModule,
    TopBarSwitchBtnModule,
    ToolTipsModule,
    AnimationModule,
    AutoBlurModule,
    FileSelectorModule,
    ScrollerModule,
    LiveRoomInfoUpperModule,
    EmptyModule,
  ],
  declarations: [
    LiveRoomComponent,
    CommentComponent,
    TimelineComponent,
    MessageComponent,
    EditorToolBarComponent,
    AudienceToolBarComponent,
    PostComponent,
    PraisedAnimationDirective,
    PraisedAnimationComponent,
    LiveRoomInfoComponent,
    TopBarComponent,
    BeginnerGuideComponent,
    RecorderComponent,
    UserInfoCardComponent
  ],
  providers: [
    TimelineService,
    CommentService,
    MessageApiService,
    CommentApiService,
    LiveInfoResolver,
    QuitEditGuard,
    UploadApiService,
    MessageService,
    AudioPlayerService,
    UserInfoCardService,
<<<<<<< 7314fccee30cb04e9169ba7611d6ed13410804d7
    { provide: HAMMER_GESTURE_CONFIG, useClass: MessageHammerConfig }
=======
    UtilsService,
>>>>>>> fix beginner guide & rm angular2-localstorage & etc
  ]
})

export class LiveRoomModule {
}
