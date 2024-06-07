import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { Application } from '@ci/portal-api';

@Component({
  selector: 'ci-apps',
  standalone: true,
  imports: [
    CoreModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './apps.component.html',
  styleUrl: './apps.component.scss'
})
export class AppsComponent {
  apps?: Application[] = [
    // { url: '', name: 'Gerencial', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'Produtos', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'Vendas', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'XCode', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'Arquivos', roles: ['MASTER'], icon: 'manager' },
    { url: '../Arquivos', name: 'Arquivos', roles: ['MASTER'], icon: undefined },
    { url: '../Cadastros', name: 'Cadastros', roles: ['MASTER'], icon: undefined },
    { url: '../Codex', name: 'Codex', roles: ['MASTER'], icon: undefined },
    { url: '../DevTools', name: 'DevTools', roles: ['MASTER'], icon: undefined },
    { url: '../Dynamic', name: 'Dynamic', roles: ['MASTER'], icon: undefined },
    { url: '../Financeiro', name: 'Financeiro', roles: ['MASTER'], icon: undefined },
    { url: '../Formularios', name: 'Formularios', roles: ['MASTER'], icon: undefined },
    { url: '../Gerencial', name: 'Gerencial', roles: ['MASTER'], icon: undefined },
    { url: '../Icons', name: 'Icons', roles: ['MASTER'], icon: undefined },
    { url: '../Imersao', name: 'Imersao', roles: ['MASTER'], icon: undefined },
    { url: '../Infra', name: 'Infra', roles: ['MASTER'], icon: undefined },
    { url: '../Instalacao', name: 'Instalacao', roles: ['MASTER'], icon: undefined },
    { url: '../LowCode', name: 'LowCode', roles: ['MASTER'], icon: undefined },
    { url: '../Mensagens', name: 'Mensagens', roles: ['MASTER'], icon: undefined },
    { url: '../Organizacao', name: 'Organizacao', roles: ['MASTER'], icon: undefined },
    { url: '../Produtos', name: 'Produtos', roles: ['MASTER'], icon: undefined },
    { url: '../Profile', name: 'Profile', roles: ['MASTER'], icon: undefined },
    { url: '../Projetos', name: 'Projetos', roles: ['MASTER'], icon: undefined },
    { url: '../SEO', name: 'SEO', roles: ['MASTER'], icon: undefined },
    { url: '../Threejs', name: 'Threejs', roles: ['MASTER'], icon: undefined },
    { url: '../Treinamento', name: 'Treinamento', roles: ['MASTER'], icon: undefined },
    { url: '../Vendas', name: 'Vendas', roles: ['MASTER'], icon: undefined },
  ]
}
