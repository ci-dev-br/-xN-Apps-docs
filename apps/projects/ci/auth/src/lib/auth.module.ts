import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { UserAuthenticationService } from './services/user-authentication-user.service';
import { RouterModule } from '@angular/router';
import { RoleDirective } from './roles/role.directive';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    RoleDirective
  ],
  providers: [
    // UserAuthenticationService,
  ]
})
export class AuthModule {
  public static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        UserAuthenticationService
      ]
    }
  }
}