import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@ci/core';
import { TenantModule } from '@ci/tenant';
import { CrmService } from './crm.service';
import { CrmEntities } from './models';
import { AgendamentoService } from './service/agendamento.service';
import { AtendimentoService } from './service/atendimento.service';
import { AtividadeCrmService } from './service/atividade-crm.service';
import { CampanhaMarketingService } from './service/campanha-marketing.service';
import { ClienteCrmService } from './service/cliente-crm.service';
import { HistoricoContatoService } from './service/historico-contato.service';
import { OportunidadeService } from './service/oportunidade.service';
import { PagamentoService } from './service/pagamento.service';
import { ProdutoService } from './service/produto.service';
import { ProfissionalService } from './service/profissional.service';
import { PromocaoService } from './service/promocao.service';
import { ServicoService } from './service/servico.service';
import { VendaProdutoService } from './service/venda-produto.service';
import { AgendamentoController } from './controller/agendamento.controller';
import { AtendimentoController } from './controller/atendimento.controller';
import { AtividadeCrmController } from './controller/atividade-crm.controller';
import { CampanhaMarketingController } from './controller/campanha-marketing.controller';
import { ClienteCrmController } from './controller/cliente-crm.controller';
import { CrmController } from './controller/crm.controller';
import { HistoricoContatoController } from './controller/historico-contato.controller';
import { OportunidadeController } from './controller/oportunidade.controller';
import { PagamentoController } from './controller/pagamento.controller';
import { ProdutoController } from './controller/produto.controller';
import { ProfissionalController } from './controller/profissional.controller';
import { PromocaoController } from './controller/promocao.controller';
import { ServicoController } from './controller/servico.controller';
import { VendaProdutoController } from './controller/venda-produto.controller';

/**
 * Módulo de CRM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...CrmEntities,
    ]),
    CoreModule,
    TenantModule,
  ],
  providers: [
    CrmService,
    AgendamentoService,
    AtendimentoService,
    AtividadeCrmService,
    CampanhaMarketingService,
    ClienteCrmService,
    HistoricoContatoService,
    OportunidadeService,
    PagamentoService,
    ProdutoService,
    ProfissionalService,
    PromocaoService,
    ServicoService,
    VendaProdutoService,
    {
      provide: 'CLIENT.MODEL.EDITABLES',
      useValue: [
        ...(CrmEntities.map(e => e.name)),
      ],
    },
  ],
  controllers: [
    CrmController,
    AgendamentoController,
    AtendimentoController,
    AtividadeCrmController,
    CampanhaMarketingController,
    ClienteCrmController,
    HistoricoContatoController,
    OportunidadeController,
    PagamentoController,
    ProdutoController,
    ProfissionalController,
    PromocaoController,
    ServicoController,
    VendaProdutoController,
  ],
  exports: [
    CrmService,
    OportunidadeService,
    AtividadeCrmService,
  ],
})
export class CrmModule { }

export * from './models';
export * from './dto/dashboard-crm.dto';
export * from './crm.service';
