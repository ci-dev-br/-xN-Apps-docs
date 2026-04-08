import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UserAuthenticationService } from '@ci/auth';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-Home  ',
  imports: [
    CoreModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    BoardModule,
  ],
  templateUrl: `home.html`,
  styleUrl: `home.scss`,
})
export class Home implements OnInit {
  g = [
    'https://images.pexels.com/photos/33258471/pexels-photo-33258471.jpeg',
    'https://images.pexels.com/photos/33869022/pexels-photo-33869022.jpeg',
    'https://images.pexels.com/photos/34234277/pexels-photo-34234277.png',
    'https://images.pexels.com/photos/6009490/pexels-photo-6009490.jpeg',
    'https://images.pexels.com/photos/11394988/pexels-photo-11394988.jpeg',
    'https://images.pexels.com/photos/34442367/pexels-photo-34442367.jpeg',
  ];
  x?: string;
  agora = new Date();
  n?: string;
  segundos?: string = ('0' + ((new Date()).getSeconds().toFixed())).substr(-2);
  y?: string;
  lapse: number = 0;
  t = false;
  ngOnInit(): void {
    this.agora = new Date();
    this.updateTime();
  }
  isBrowser: boolean;
  isDeveloper?: boolean;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly authUser: UserAuthenticationService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      authUser.user.subscribe(user => {
        if (user!.roles!.indexOf('DEVELOPER') !== -1) {
          this.isDeveloper = true;
        }
      })
    }
  }
  async updateTime() {
    let o = this.n || 0;
    this.n = (Date.now()).toString().substr(-3);
    try {
      this.lapse = Number(((Number(this.n) || 0) / 100).toFixed().substr(-1));
    } catch (error) { }
    setTimeout(() => { this.updateTime() }, 10);
    try {
      if (this.lapse !== 0) {
        if (!!this.t) this.t = false;
        return;
      }
      if (!this.t) {
        let os = ('0' + (new Date()).getSeconds()).substr(-2);
        if (os !== this.segundos) {
          this.t = true;
          this.segundos = os;
        }
        if (this.segundos === '00') {
          this.agora = new Date();
        }
      }
    } catch (error) {

    }
  }
  async load() {
    // removidor temporariamente: Esta provocando travamento no contador.
    // let a = this.g[Math.round(Math.random() * (this.g.length - 1))];
    // this.http
    /* fetch('' + a).then((r) => {
      if (r.status === 200) {
        this.x = a;
        a = this.g[Math.round(Math.random() * (this.g.length - 1))];
      } else {
        this.load();
      }
    }) */
  }
  async alternateDeveloperProduction() {
    if (this.authUser.user.value!.roles!.indexOf('DEVELOPER') > -1) {
      location.href = location.href.indexOf('apps.') > -1 ? location.href.replace('apps.', 'development.') : location.href.replace('development.', 'apps.');
    }
  }
}
