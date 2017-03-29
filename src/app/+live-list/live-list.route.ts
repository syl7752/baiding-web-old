import {ModuleWithProviders, NgModule} from "@angular/core";
import {Routes, RouterModule} from '@angular/router';
import {LiveListComponent} from "./live-list.component";
import {AuthGuard} from "../shared/guard/auth.guard";
import {UserInfoResolver} from "../shared/guard/user-info.resolver";
import {environment} from "../../environments/environment";

const route: Routes = [
  {
    path: '',
    component: LiveListComponent,
    data: {
      title: environment.config.name,
    },
    resolve: {
      userInfo: UserInfoResolver,
    },
    canActivate: [AuthGuard]
  },
];

const ROUTES: ModuleWithProviders = RouterModule.forChild(route);

@NgModule({
  imports: [ ROUTES ],
  exports: [ RouterModule ]
})
export class LiveListRoutingModule {}
