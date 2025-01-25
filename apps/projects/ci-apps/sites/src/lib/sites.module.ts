import { NgModule } from '@angular/core';
import { SitesComponent } from './sites.component';
/**
 * Aplicativo Gestor de Sites e Campanhas
 * 
 * Gestão de site e campanhas é adaptado para gartatir a entrega no tempo programado sem atrasos por falha na gestão da infraestrutura, a ferramenta de Sites e Campanhas garante a entrega independende do fluxo de dados em cima da comunicação necessária para garantir as operações necessárias para a entrega dos serviços
 */
@NgModule({
  declarations: [
    SitesComponent
  ],
  imports: [
  ],
  exports: [
    SitesComponent
  ]
})
export class SitesModule { }
