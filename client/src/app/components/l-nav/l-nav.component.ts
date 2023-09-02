import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Application } from 'src/app/api/models';
import { ApplicationService } from 'src/app/api/services';
import { UserService } from 'src/app/services/user.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'ci-l-nav',
  templateUrl: './l-nav.component.html',
  styleUrls: ['./l-nav.component.scss']
})
export class LNavComponent {
  apps?: Application[];
  $user = this.userService.user;
  constructor(
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService
  ) {
    this.load();
  }
  load() {
    (async () => { this.apps = await lastValueFrom(this.applicationService.get()) })();
  }
  sair() {
    this.userService.sair();
  }
}
