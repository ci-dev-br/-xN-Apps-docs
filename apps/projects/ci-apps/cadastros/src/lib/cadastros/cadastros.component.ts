import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthModule } from '@ci/auth';
import { BoardModule, LNavModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { CadastroService, IDynamicForm } from '@ci/portal-api';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { BreakpointObserver, BreakpointState, LayoutModule } from '@angular/cdk/layout';
import { MatMenuModule } from '@angular/material/menu';
import { MenuService } from '../menu-servive';

const IS_SMALL = '(max-width: 599px)';
interface IMenuItem {
  description?: string | null;
  title?: string | null;
  path?: string | null;
  icon?: string | null;
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
    BoardModule,
  ],
  standalone: true,
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent implements OnInit {
  isSmallScreen: BehaviorSubject<BreakpointState> = new BehaviorSubject(null as any);
  currentForm?: IDynamicForm;
  menu?: IMenuItem[];
  activeEntity?: string;

  private readonly entityIcons: Record<string, string> = {
    Endereco: 'place',
    Pessoa: 'person',
    InformacaoContato: 'contact_phone',
    DocumentoIdentificacao: 'badge',
    TipoDocumentoIdentificacao: 'assignment_ind',
    Category: 'category',
    UnidadeMedida: 'straighten',
    Pais: 'public',
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cadastro: CadastroService,
    breakpointObserver: BreakpointObserver,
    public readonly menus: MenuService,
  ) {
    this.montarMenu();
    breakpointObserver.observe(IS_SMALL).subscribe(v => this.isSmallScreen.next(v));
  }
  async montarMenu() {
    this.menu = (await firstValueFrom(
      this.cadastro.editables()
    ) || []).map((E: string) => {
      return {
        title: E,
        description: E,
        path: E,
        icon: this.entityIcons[E] || 'article',
      };
    });
    const childEntity = this.route.firstChild?.snapshot?.params?.['EntityName'];
    if (childEntity) {
      this.activeEntity = childEntity;
    } else if (this.menu.length > 0 && this.menu[0].path) {
      await this.abrirItemMenu(this.menu[0].path);
    }
  }
  async abrirItemMenu(path?: string) {
    if (!!path) {
      this.activeEntity = path;
      await this.router.navigate([`${path}`], { relativeTo: this.route });
    }
  }
  abrir(form: IDynamicForm) {
    this.currentForm = form;
  }
  ngOnInit(): void {
  }
}
