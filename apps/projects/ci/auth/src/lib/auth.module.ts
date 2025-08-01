import { NgModule } from '@angular/core';
import { UserService } from './services/user.service';
import { CoreModule } from '@ci/core';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [
    CoreModule,
    RouterModule,
  ],
  providers: [
  ]
})
export class AuthModule { }
export {
  UserService,
}