import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TalkService} from "../../shared/api/talk/talk.api";
import {ArticleComponent} from "./article.component";
import {VideoPlayerModule} from "../../shared/video-player/video-player.module";
import {LoadingModule} from "../../shared/bd-loading/bd-loading.module";
import {RouterModule} from "@angular/router";
import {ObjectService} from "../../shared/api/object/object.api";

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    VideoPlayerModule,
    LoadingModule,
  ],
  declarations: [
    ArticleComponent,
  ],
  providers: [
    TalkService,
    ObjectService,
  ]
})

export class ArticleModule {
}
