import { NgModule } from '@angular/core';
import { AuthUserService } from './services/auth-user.service';
import { CoreModule } from '@ci/core';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [
    CoreModule,
    RouterModule,
  ],
  providers: [
    AuthUserService,
  ]
})
export class AuthModule { }