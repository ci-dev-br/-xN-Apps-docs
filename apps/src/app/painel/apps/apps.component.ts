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


  apps?: any[] = [
    // { url: '', name: 'Gerencial', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'Produtos', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'Vendas', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'XCode', roles: ['MASTER'], icon: 'manager' },
    // { url: '', name: 'Arquivos', roles: ['MASTER'], icon: 'manager' },
    { color: this.getColor(), url: '../Arquivos', name: 'Arquivos', roles: ['MASTER'], icon: 'home_storage' },
    { color: this.getColor(), url: '../Cadastros', name: 'Cadastros', roles: ['MASTER'], icon: 'how_to_reg' },
    { color: this.getColor(), url: '../Codex', name: 'Codex', roles: ['MASTER'], icon: 'code' },
    { color: this.getColor(), url: '../DevTools', name: 'DevTools', roles: ['MASTER'], icon: 'handyman' },
    { color: this.getColor(), url: '../Dynamic', name: 'Dynamic', roles: ['MASTER'], icon: 'dynamic_form' },
    { color: this.getColor(), url: '../Financeiro', name: 'Financeiro', roles: ['MASTER'], icon: 'finance' },
    { color: this.getColor(), url: '../Formularios', name: 'Formularios', roles: ['MASTER'], icon: 'fact_check' },
    { color: this.getColor(), url: '../Gerencial', name: 'Gerencial', roles: ['MASTER'], icon: 'bookmark_manager' },
    { color: this.getColor(), url: '../Icons', name: 'Icons', roles: ['MASTER'], icon: 'add_reaction' },
    { color: this.getColor(), url: '../Imersao', name: 'Imersao', roles: ['MASTER'], icon: 'view_in_ar' },
    { color: this.getColor(), url: '../Infra', name: 'Infra', roles: ['MASTER'], icon: 'lan' },
    { color: this.getColor(), url: '../Instalacao', name: 'Instalacao', roles: ['MASTER'], icon: 'deployed_code' },
    { color: this.getColor(), url: '../LowCode', name: 'LowCode', roles: ['MASTER'], icon: 'variable_add' },
    { color: this.getColor(), url: '../Mensagens', name: 'Mensagens', roles: ['MASTER'], icon: 'chat' },
    { color: this.getColor(), url: '../Organizacao', name: 'Organizacao', roles: ['MASTER'], icon: 'corporate_fare' },
    { color: this.getColor(), url: '../Produtos', name: 'Produtos', roles: ['MASTER'], icon: 'inventory' },
    { color: this.getColor(), url: '../Profile', name: 'Profile', roles: ['MASTER'], icon: 'face' },
    { color: this.getColor(), url: '../Projetos', name: 'Projetos', roles: ['MASTER'], icon: 'tactic' },
    { color: this.getColor(), url: '../SEO', name: 'SEO', roles: ['MASTER'], icon: 'robot_2' },
    { color: this.getColor(), url: '../Threejs', name: 'Threejs', roles: ['MASTER'], icon: '3d_rotation' },
    { color: this.getColor(), url: '../Treinamento', name: 'Treinamento', roles: ['MASTER'], icon: 'school' },
    { color: this.getColor(), url: '../Vendas', name: 'Vendas', roles: ['MASTER'], icon: 'store' },
  ]

  getColor() {
    const hex = () => (13 + Math.floor(Math.random() * 3)).toString(16);
    return `#${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`.toUpperCase()
  }
}
