import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmEntities } from './models';
import { CoreModule } from '@ci/core';
import { AgendamentoService } from './service/agendamento.service';
import { AtendimentoService } from './service/atendimento.service';
import { ClienteCrmService } from './service/cliente-crm.service';
import { HistoricoContatoService } from './service/historico-contato.service';
import { PagamentoService } from './service/pagamento.service';
import { ProdutoService } from './service/produto.service';
import { ProfissionalService } from './service/profissional.service';
import { PromocaoService } from './service/promocao.service';
import { ServicoService } from './service/servico.service';
import { VendaProdutoService } from './service/venda-produto.service';
import { VendaProdutoController } from './controller/venda-produto.controller';
import { ServicoController } from './controller/servico.controller';
import { PromocaoController } from './controller/promocao.controller';
import { ProfissionalController } from './controller/profissional.controller';
import { ProdutoController } from './controller/produto.controller';
import { PagamentoController } from './controller/pagamento.controller';
import { HistoricoContatoController } from './controller/historico-contato.controller';
import { ClienteCrmController } from './controller/cliente-crm.controller';
import { AtendimentoController } from './controller/atendimento.controller';
import { AgendamentoController } from './controller/agendamento.controller';
import { TenantModule } from '@ci/tenant';
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
    ServicoService,
    PromocaoService,
    ProfissionalService,
    ProdutoService,
    PagamentoService,
    HistoricoContatoService,
    ClienteCrmService,
    AtendimentoService,
    VendaProdutoService,
    AgendamentoService,
  ],
  controllers: [
    VendaProdutoController,
    ServicoController,
    PromocaoController,
    ProfissionalController,
    ProdutoController,
    PagamentoController,
    HistoricoContatoController,
    ClienteCrmController,
    AtendimentoController,
    AgendamentoController,
  ],
  exports: [
    CrmService,
  ],
})
export class CrmModule { }
export * from './models';

