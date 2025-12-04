import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { /* ActivatedRoute */ ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
// import { APPS, IApp } from './apps';
import { AuthModule, UserService } from '@ci/auth';
import { BoardModule } from '@ci/components';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'ci-apps',
  imports: [
    CoreModule,
    MatIconModule,
    RouterModule,
    BoardModule,
    AuthModule,

    MatTabsModule,
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
  // apps?: IApp[];
  abas?: { label: string, path: string, icon: string }[];
  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }
  async ngOnInit() {
    this.abas = this.route.routeConfig?.children?.map(r => {
      return {
        label: r.title || (r?.data as any)?.title || r.path,
        path: '/' + r.path,
        icon: (r?.data as any)?.icon || undefined,
      } as { label: string, path: string, icon: string }
    }) || undefined;
    this.userService.user.subscribe(user => {
      if (!!user) {
        // this.apps = APPS.filter(app => !!this.userService && !!this.userService.user && !!this.userService.user.value ?
        // this.userService.user?.value?.roles?.find(role => // app.roles && app.roles.indexOf(role) > -1) : false);
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
