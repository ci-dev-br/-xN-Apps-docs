import { NgModule } from '@angular/core';
import { UserAuthenticationService } from './services/user-authentication-user.service';
import { CoreModule } from '@ci/core';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [
    CoreModule,
    RouterModule,
  ],
  providers: [
    UserAuthenticationService,
  ]
})
export class AuthModule { }