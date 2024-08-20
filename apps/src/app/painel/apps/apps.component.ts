import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CI_ICON_PACK, CoreModule, IPack, LoadIconsModule, LoadIconsService } from '@ci/core';
import { Application } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { APPS } from './apps';
import { AuthModule, UserService } from '@ci/auth';

@Component({
  selector: 'ci-apps',
  standalone: true,
  imports: [
    CoreModule,
    MatIconModule,
    RouterModule,
    AuthModule,
    LoadIconsModule,
  ],
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
  apps?: any[];
  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly loadIcons: LoadIconsService,
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
    })
  }
  async ngOnInit() {
    this.userService.user.subscribe(user => {
      if (!!user) {
        this.apps = APPS.filter(app => !!this.userService && !!this.userService.user && !!this.userService.user.value ?
          this.userService.user?.value?.roles?.find(role => app.roles.indexOf(role) > -1) : false);
      } else {
        // this.router.navigate(['/']);
      }
    })
  }
  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      window.open(location.href + '/' + app.url, '')
    } else {
      this.router.navigate([app.url], {/*  relativeTo: this.route */ });
    }
  }
}
