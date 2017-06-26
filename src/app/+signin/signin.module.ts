import {NgModule} from '@angular/core';
import {SigninRoutingModule} from "./signin.route";
import {SigninComponent} from "./signin.component";
import {CommonModule} from "@angular/common";
import {FormModule} from "../shared/form/form.module";
import {ReactiveFormsModule} from "@angular/forms";
import {SenderApiService} from "../shared/api/sender/sender.api";
import {GuestGuard} from "../shared/guard/guest.guard";
import {LoadingModule} from "../shared/bd-loading/bd-loading.module";
import {ResetPwdComponent} from "./reset/reset.component";

@NgModule({
  imports: [
    CommonModule,
    SigninRoutingModule,
    ReactiveFormsModule,
    FormModule,
    LoadingModule,
  ],
  declarations: [
    SigninComponent,
    ResetPwdComponent,
  ],
  providers: [
    SenderApiService,
    GuestGuard,
  ]
})

export class SigninModule {

}