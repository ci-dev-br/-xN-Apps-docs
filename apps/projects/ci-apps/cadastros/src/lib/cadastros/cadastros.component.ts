import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthModule } from '@ci/auth';
import { LNavModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { CadastroService, IDynamicForm } from '@ci/portal-api';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { BreakpointObserver, BreakpointState, LayoutModule } from '@angular/cdk/layout';
import { MatMenuModule } from '@angular/material/menu';

const IS_SMALL = '(max-width: 599px)';
interface IMenuItem {
  description?: string | null;
  title?: string | null;
  path?: string | null;
}
@Component({
  selector: 'ci-cadastros',
  imports: [
    CoreModule,
    MatToolbarModule,
    LNavModule,
    MatIconModule,
    AuthModule,
    MatButtonModule,
    MatSidenavModule,
    RouterModule,
    LayoutModule,
    MatMenuModule,
  ],
  standalone: true,
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent implements OnInit {
  isSmallScreen: BehaviorSubject<BreakpointState> = new BehaviorSubject(null as any);
  currentForm?: IDynamicForm;
  menu?: IMenuItem[];
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cadastro: CadastroService,
    breakpointObserver: BreakpointObserver,
  ) {
    this.montarMenu();
    breakpointObserver.observe(IS_SMALL).subscribe(v => this.isSmallScreen.next(v));
  }
  async montarMenu() {
    this.menu = (await firstValueFrom(
      this.cadastro.cadastroControllerEditables()
    ) || []).map((E: string) => {
      return {
        title: E,
        description: E,
        path: E,
      }
    });
  }
  async abrirItemMenu(path?: string) {
    if (!!path)
      this.router.navigate([`${path}`], { relativeTo: this.route });
  }
  abrir(form: IDynamicForm) {
    this.currentForm = form;
  }
  ngOnInit(): void {
  }
}
