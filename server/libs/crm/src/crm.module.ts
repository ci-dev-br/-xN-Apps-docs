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
/**
 * Módulo de CRM
 */
@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([
      ...CrmEntities,
    ])
  ],
  providers: [
    CrmService,
    VendaProdutoService,
    ServicoService,
    PromocaoService,
    ProfissionalService,
    ProdutoService,
    PagamentoService,
    HistoricoContatoService,
    ClienteCrmService,
    AtendimentoService,
    AgendamentoService,
  ],
  exports: [
    CrmService,
  ],
})
export class CrmModule { }
