import { Component, inject, OnInit, Optional } from '@angular/core';
import { CoreModule, LoadIconsModule, IconLoaderSerices, StorageService } from '@ci/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CI_STATIC_APPS, IApp } from './apps/apps';
import { AuthModule, USER_MENU, UserAuthenticationService } from '@ci/auth';
import { IconModule, NavbarModule } from '@ci/components';
import { IItemMenu } from '@ci/components/window';
@Component({
  selector: 'ci-painel',
  imports: [
    CoreModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSidenavModule,
    RouterModule,
    AuthModule,
    MatTooltipModule,
    LoadIconsModule,
    IconModule,
    NavbarModule,
  ],
  standalone: true,
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent implements OnInit {
  user = this.userAuthenticationInstanceService?.user
  apps?: any[];
  userMenuList?: IItemMenu[] = inject(USER_MENU, { optional: true }) || undefined;
  constructor(
    @Optional() private readonly router?: Router,
    @Optional() private readonly userAuthenticationInstanceService?: UserAuthenticationService,
    // @Optional() private readonly route: ActivatedRoute,
    @Optional() iconLoader?: IconLoaderSerices,
  ) {
    iconLoader?.load({ /// TODO: mover para fora
      'devtools': { url: 'icons/dev-tools-icon.svg' },
      imersao: { url: 'icons/imersao.svg' },
      agenda: { url: 'icons/agenda.svg' },
      anotacoes: { url: 'icons/anotacoes.svg' },
      cadastros: { url: 'icons/v2/cadastros.svg' },
      carteira: { url: 'icons/carteira.svg' },
      codex: { url: 'icons/v2/codex.svg' },
      "dev-tools": { url: 'icons/dev-tools.svg' },
      dynamic: { url: 'icons/v2/dynamix-xd.svg' },
      estudos: { url: 'icons/estudos.svg' },
      files: { url: 'icons/v2/arquivos.svg' },
      financeiro: { url: 'icons/financeiro.svg' },
      formularios: { url: 'icons/formularios.svg' },
      fotos: { url: 'icons/fotos.svg' },
      gerencial: { url: 'icons/v2/gerencial.svg' },
      icones: { url: 'icons/v2/icons.svg' },
      infra: { url: 'icons/v2/infra.svg' },
      instalacao: { url: 'icons/instalacao.svg' },
      journal: { url: 'icons/journal.svg' },
      "low-code": { url: 'icons/v2/low-code.svg' },
      mail: { url: 'icons/mail.svg' },
      mensagens: { url: 'icons/mensagens.svg' },
      organizacao: { url: 'icons/v2/organizacao.svg' },
      perfil: { url: 'icons/v2/profile.svg' },
      produtos: { url: 'icons/v2/produtos.svg' },
      projetos: { url: 'icons/v2/projetos.svg' },
      seo: { url: 'icons/seo.svg' },
      threejs: { url: 'icons/threejs.svg' },
      tradutor: { url: 'icons/tradutor.svg' },
      treinamento: { url: 'icons/v2/treinamento.svg' },
      vendas: { url: 'icons/v2/vendas.svg' },
      crm: { url: 'icons/v2/crm.svg' },
      cms: { url: 'icons/v3/cms.svg' },
      ADMIN: { url: 'icons/extras/admin mode.svg' },
      SYSADMIN: { url: 'sysadmin.svg' },
      GOODNESS: { url: 'goodness.svg' },
      USER: { url: 'icons/extras/user mode.svg' },
      MASTER: { url: 'icons/extras/master mode.svg' },
      GOD: { url: 'icons/extras/god mode.svg' },
    });
    this.userAuthenticationInstanceService?.user.subscribe(user => {
      if (!!user) {
        this.apps = CI_STATIC_APPS.filter(app => !!app.roles?.find(role => !!user.roles?.find(r => r === role)))
      }
    })
  }
  private _appsFavoritos?: IApp[] | undefined = [];
  public get appsFavoritos(): IApp[] | undefined {
    if (!this._appsFavoritos) this.appsFavoritos = this.apps;
    return this._appsFavoritos;
  }
  favs?: IApp[];
  public set appsFavoritos(value: IApp[] | undefined) {
    let x = [...(value || [])];
    let order = [...x];
    order.sort((a, b) => (a.__cta_hndlred || 0) > (b.__cta_hndlred || 0) ? -1 : (a.__cta_hndlred || 0) < (b.__cta_hndlred || 0) ? 1 : 0);
    x.forEach((a, i) => a.__presentation_order = order.indexOf(a));
    this._appsFavoritos = value;
    if (this.favs !== value) this.favs = value;
    localStorage.setItem('x-menu-cached-favs', JSON.stringify(this.apps?.map(x => x.__cta_hndlred || 0)));
  }
  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      // window.open(location.href + '/' + app.url, '')
    } else {
      // this.router.navigate(['/' + app.url], { relativeTo: this.route.root })
    }
    setTimeout(() => document.body.click(), 300);
    if (app.__cta_hndlred === undefined) app.__cta_hndlred = 0;
    app.__cta_hndlred++;
    this.appsFavoritos = this.apps;
  }
  async sair() {
    this.userAuthenticationInstanceService?.sair();
  }
  async repo() {
    window.open('https://github.com/ci-dev-br/-xN-Apps-docs', '_blank')
  }
  async profile() {
    this.router?.navigate(['/profile'])
  }
  protected async itemMenuActionHandler(itemMenu: IItemMenu, event: Event) {
    if (itemMenu.onClick) itemMenu.onClick(this, event);
  }
  ngOnInit(): void {
    let c: string | number[] | null = localStorage.getItem('x-menu-cached-favs');
    if (typeof c === 'string') c = JSON.parse(c) as number[];
    this.apps?.forEach((e, i, a) => {
      e.__cta_hndlred = (c as any)[i];
    });

    setTimeout(() => {
      this.appsFavoritos = [...this.apps || []];
    })
  }
}
