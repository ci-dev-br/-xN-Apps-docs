import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'ci-l-nav',
  templateUrl: './l-nav.component.html',
  styleUrls: ['./l-nav.component.scss']
})
export class LNavComponent {
  $user = this.userService.user;
  constructor(
    private readonly userService: UserService,
  ) { }
  sair() {
    this.userService.sair();
  }
}
