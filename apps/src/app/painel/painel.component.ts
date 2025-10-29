import { Component, inject } from '@angular/core';
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
import { APPS } from './apps/apps';
import { AuthModule, USER_MENU, UserService } from '@ci/auth';
import { LogoComponent, IconModule, IItemMenu } from '@ci/components';
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
    LogoComponent,
    LoadIconsModule,
    IconModule,
  ],
  standalone: true,
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {
  user = this.userService.user
  apps?: any[];
  userMenuList?: IItemMenu[] = inject(USER_MENU, { optional: true }) || undefined;
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    iconLoader: IconLoaderSerices,
  ) {
    iconLoader.load({
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
    });
    this.userService.user.subscribe(user => {
      if (!!user) {
        this.apps = APPS.filter(app => !!app.roles?.find(role => !!user.roles?.find(r => r === role)))
      }
    })
  }
  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      // window.open(location.href + '/' + app.url, '')
    } else {
      // this.router.navigate(['/' + app.url], { relativeTo: this.route.root })
    }
    setTimeout(() => document.body.click(), 300)
  }
  async sair() {
    this.userService.sair();
  }
  async repo() {
    window.open('https://github.com/ci-dev-br/-xN-Apps-docs', '_blank')
  }
  async profile() {
    this.router.navigate(['/Profile'])
  }
  protected async itemMenuActionHandler(itemMenu: IItemMenu, event: Event) {
    if (itemMenu.onClick) itemMenu.onClick(this, event);
  }
}
