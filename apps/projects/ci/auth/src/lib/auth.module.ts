import { NgModule } from '@angular/core';
import { UserAuthenticationService } from './services/user-authentication-user.service';
import { CoreModule } from '@ci/core';
import { RouterModule } from '@angular/router';
import { RoleDirective } from './roles/role.directive';
@NgModule({
  imports: [
    CoreModule,
    RouterModule,
  ],
  declarations: [
    RoleDirective
  ],
  providers: [
    UserAuthenticationService,
  ]
})
export class AuthModule { }