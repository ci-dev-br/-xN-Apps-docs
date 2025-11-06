import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { APPS, IApp } from './apps';
import { AuthModule, UserService } from '@ci/auth';
import { BoardModule } from '@ci/components';

@Component({
  selector: 'ci-apps',
  imports: [
    CoreModule,
    MatIconModule,
    RouterModule,
    BoardModule,
    AuthModule,
  ],
  standalone: true,
  providers: [
    /*  {
       provide: CI_ICON_PACK, useValue: {
         agenda: { url: 'icons/agenda.svg' }
       }, multi: true
     } */
  ],
  templateUrl: './apps.component.html',
  styleUrl: './apps.component.scss'
})
export class AppsComponent implements OnInit {
  apps?: IApp[];
  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }
  async ngOnInit() {
    this.userService.user.subscribe(user => {
      if (!!user) {
        this.apps = APPS.filter(app => !!this.userService && !!this.userService.user && !!this.userService.user.value ?
          this.userService.user?.value?.roles?.find(role => app.roles && app.roles.indexOf(role) > -1) : false);
      } else {
        // this.router.navigate(['/']);
      }
    })
  }
  async appClickHandler(event: any, app: any) {
    if (event.ctrlKey) {
      window.open(location.href + '/' + app.url, '')
    } else {
      this.router.navigate([app.url], {/*  relativeTo: this.route */ });
    }
  }
  /// @HostListener('window:contextmenu', ['$event'])
  contextMenuHanlder(event: MouseEvent | PointerEvent | Event) {
    event.preventDefault;
  }

  @HostListener('keyup', ['$event'])
  keyUpHandler(e: KeyboardEvent) {
    if (e.key == 'PrintScreen') {
      navigator.clipboard.writeText('');
      alert('Screenshots disabled!');
    }
  };

  @HostListener('keydown', ['$event'])
  keyDownHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key == 'p') {
      alert('This section is not allowed to print or export to PDF');
      e.cancelBubble = true;
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };
}
