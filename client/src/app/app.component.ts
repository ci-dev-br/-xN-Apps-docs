import { Component, Inject } from '@angular/core';
import { ChildActivationStart, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from './services/user.service';
import { PaginaErroComponent } from './views/pagina-erro/pagina-erro.component';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'ci-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private _original_title = this.document.title;
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    @Inject(DOCUMENT)
    private readonly document: Document,
  ) {
    router.events.subscribe(v => {
      try {
        if (!!(v as any)?.snapshot?.data?.name) {
          document.title = this._original_title + ' - ' + (v as any)?.snapshot?.data?.name;
        }
      } catch (error) { }
      if (!!(v as any)?.snapshot && !!(v as any).snapshot?.data) {
        if ('role' in (v as any).snapshot.data) {
          try {
            const role = ((v as any).snapshot.data as any).role
          const granted = this.userService.user.value?.roles?.find(v => v === role);
            if (granted) {
            } else {
              throw new Error('Acesso Restrito');
            }
          } catch (error) {
            if ((v as any)?.snapshot?.component) {
              (v as any).snapshot.component = PaginaErroComponent;
            }
          }
        }
      }
    });
  }
}
