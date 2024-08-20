import { Component } from '@angular/core';
import { CoreModule, LoadIconsModule, LoadIconsService, StorageService } from '@ci/core';
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
import { AuthModule, UserService } from '@ci/auth';
import { LogoComponent } from '@ci/components';
@Component({
  selector: 'ci-painel',
  standalone: true,
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
  ],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {
  user = this.userService.user
  apps?: any[];
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    loadIcons: LoadIconsService,
  ) {
    loadIcons.load({
      imersao: { url: 'icons/imersao.svg' },
      agenda: { url: 'icons/agenda.svg' },
      anotacoes: { url: 'icons/anotacoes.svg' },
      cadastros: { url: 'icons/cadastros.svg' },
      carteira: { url: 'icons/carteira.svg' },
      codex: { url: 'icons/codex.svg' },
      "dev-tools": { url: 'icons/dev-tools.svg' },
      dynamic: { url: 'icons/dynamic.svg' },
      estudos: { url: 'icons/estudos.svg' },
      files: { url: 'icons/files.svg' },
      financeiro: { url: 'icons/financeiro.svg' },
      formularios: { url: 'icons/formularios.svg' },
      fotos: { url: 'icons/fotos.svg' },
      gerencial: { url: 'icons/gerencial.svg' },
      icones: { url: 'icons/icones.svg' },
      infra: { url: 'icons/infra.svg' },
      instalacao: { url: 'icons/instalacao.svg' },
      journal: { url: 'icons/journal.svg' },
      "low-code": { url: 'icons/low-code.svg' },
      mail: { url: 'icons/mail.svg' },
      mensagens: { url: 'icons/mensagens.svg' },
      organizacao: { url: 'icons/organizacao.svg' },
      perfil: { url: 'icons/perfil.svg' },
      produtos: { url: 'icons/produtos.svg' },
      projetos: { url: 'icons/projetos.svg' },
      seo: { url: 'icons/seo.svg' },
      threejs: { url: 'icons/threejs.svg' },
      tradutor: { url: 'icons/tradutor.svg' },
      treinamento: { url: 'icons/treinamento.svg' },
      vendas: { url: 'icons/vendas.svg' },
    });

    this.userService.user.subscribe(user => {
      if (!!user) {
        this.apps = APPS.filter(app => !!app.roles.find(role => !!user.roles?.find(r => r === role)))
      }
    })
  }

  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      window.open(location.href + '/' + app.url, '')
    } else {
      this.router.navigate(['/' + app.url], { relativeTo: this.route.root })
    }
    setTimeout(() => document.body.click(), 300)
  }

  async sair() {
    this.userService.sair();
    setTimeout(() =>
      this.router.navigate(['/'])
    );
  }
  async repo() {
    window.open('https://github.com/ci-dev-br/-xN-Apps-docs', '_blank')
  }
}
