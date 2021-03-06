import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";

import {HistoryRoutingModule} from './history.route';
import {HistoryComponent} from "./history.component";
import {PipeModule} from "../../shared/pipe/pipe.module";
import {LoadingModule} from "../../shared/bd-loading/bd-loading.module";
import {CommentInputModule} from "../../shared/comment-input/comment-input.module";
import {AtKeyBoardModule} from "../../shared/at-keyboard/at-keyboard.module";
import {HammerGestureConfig, HAMMER_GESTURE_CONFIG} from "@angular/platform-browser";
import {HammerInstance} from "@angular/platform-browser/src/dom/events/hammer_gestures";
import {AudioPlayerModule} from "../../shared/audio-player/audio-player.module";
import {MessageEditorComponent} from "./message-editor/message-editor.component";
import {HistoryMessageResolver} from "./history.resolver";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormModule} from "../../shared/form/form.module";
import {HistoryService} from "./history.service";
import {FileSelectorModule} from "../../shared/file-selector/file-selector.module";
import {CommentApiService} from "../../shared/api/comment/comment.service";
import {LiveRoomService} from "../live-room.service";
import {MessageApiService} from "../../shared/api/message/message.api";
import {TimelineService} from "../timeline/timeline.service";
import {UploadApiService} from "../../shared/api/upload/upload.api";
import {UserInfoCardService} from "../../shared/user-info-card/user-info-card.service";
import {LiveRoomTitleResolver} from "../../shared/guard/title.resolver";

export class MessageHammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement): HammerInstance {
    let mc = new Hammer(element, {domEvents: true});
    mc.get('press').set({time: 500});
    return mc;
  }
}

@NgModule({
  imports: [
    CommonModule,
    PipeModule,
    LoadingModule,
    HistoryRoutingModule,
    CommentInputModule,
    AtKeyBoardModule,
    AudioPlayerModule,
    FormsModule,
    FormModule,
    ReactiveFormsModule,
    FileSelectorModule,
  ],
  declarations: [
    HistoryComponent,
    MessageEditorComponent,
  ],
  providers: [
    LiveRoomService,
    TimelineService,
    UploadApiService,
    UserInfoCardService,
    MessageApiService,
    HistoryService,
    HistoryMessageResolver,
    CommentApiService,
    LiveRoomTitleResolver,
    {provide: HAMMER_GESTURE_CONFIG, useClass: MessageHammerConfig},
  ]
})

export class HistoryModule {
}
