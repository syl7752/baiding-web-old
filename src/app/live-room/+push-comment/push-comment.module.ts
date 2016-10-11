import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { ROUTES } from './push-comment.route';
import { PushCommentComponent } from './push-comment.component';
import { PipeModule } from "../../shared/pipe/pipe.module";
import {LoadingModule} from "../../shared/bd-loading/bd-loading.module";

@NgModule({
  imports: [
    CommonModule,
    ROUTES,
    PipeModule,
    LoadingModule,
  ],
  declarations: [
    PushCommentComponent,
  ],
})

export class PushCommentModule {}