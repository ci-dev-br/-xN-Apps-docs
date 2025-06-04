/* tslint:disable */
/* eslint-disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { ApiService } from './services/api.service';
import { SystemService } from './services/system.service';
import { DeviceService } from './services/device.service';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';
import { ApplicationService } from './services/application.service';
import { DomainService } from './services/domain.service';
import { ContactsService } from './services/contacts.service';
import { ChamadaService } from './services/chamada.service';
import { ProductService } from './services/product.service';
import { PranchetaService } from './services/prancheta.service';
import { UserService } from './services/user.service';
import { PhotoService } from './services/photo.service';
import { FileExplorerService } from './services/file-explorer.service';
import { VideoService } from './services/video.service';
import { CadastroService } from './services/cadastro.service';
import { EnderecoService } from './services/endereco.service';
import { InformacaoContatoService } from './services/informacao-contato.service';
import { PessoaService } from './services/pessoa.service';
import { UnidadeMedidaService } from './services/unidade-medida.service';
import { PaisService } from './services/pais.service';
import { OrganizacaoService } from './services/organizacao.service';
import { FormsService } from './services/forms.service';
import { ProjetoService } from './services/projeto.service';
import { VendaProdutoService } from './services/venda-produto.service';
import { ServicoService } from './services/servico.service';
import { PromocaoService } from './services/promocao.service';
import { ProfissionalService } from './services/profissional.service';
import { ProdutoService } from './services/produto.service';
import { PagamentoService } from './services/pagamento.service';
import { HistoricoContatoService } from './services/historico-contato.service';
import { ClienteCrmService } from './services/cliente-crm.service';
import { AtendimentoService } from './services/atendimento.service';
import { AgendamentoService } from './services/agendamento.service';

export function getServiceAsSchema(schema: string): Type<any>{
  return ({ 'ApiService': ApiService,'SystemService': SystemService,'DeviceService': DeviceService,'MessageService': MessageService,'AuthService': AuthService,'ApplicationService': ApplicationService,'DomainService': DomainService,'ContactsService': ContactsService,'ChamadaService': ChamadaService,'ProductService': ProductService,'PranchetaService': PranchetaService,'UserService': UserService,'PhotoService': PhotoService,'FileExplorerService': FileExplorerService,'VideoService': VideoService,'CadastroService': CadastroService,'EnderecoService': EnderecoService,'InformacaoContatoService': InformacaoContatoService,'PessoaService': PessoaService,'UnidadeMedidaService': UnidadeMedidaService,'PaisService': PaisService,'OrganizacaoService': OrganizacaoService,'FormsService': FormsService,'ProjetoService': ProjetoService,'VendaProdutoService': VendaProdutoService,'ServicoService': ServicoService,'PromocaoService': PromocaoService,'ProfissionalService': ProfissionalService,'ProdutoService': ProdutoService,'PagamentoService': PagamentoService,'HistoricoContatoService': HistoricoContatoService,'ClienteCrmService': ClienteCrmService,'AtendimentoService': AtendimentoService,'AgendamentoService': AgendamentoService, }[ schema + 'Service'] as any) || undefined;
} 

/**
 * Module that provides all services and configuration.
 */
@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    ApiConfiguration
  ],
})
export class ApiModule {
  static forRoot(params: ApiConfigurationParams): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [
        ApiService,
        SystemService,
        DeviceService,
        MessageService,
        AuthService,
        ApplicationService,
        DomainService,
        ContactsService,
        ChamadaService,
        ProductService,
        PranchetaService,
        UserService,
        PhotoService,
        FileExplorerService,
        VideoService,
        CadastroService,
        EnderecoService,
        InformacaoContatoService,
        PessoaService,
        UnidadeMedidaService,
        PaisService,
        OrganizacaoService,
        FormsService,
        ProjetoService,
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
        {
          provide: ApiConfiguration,
          useValue: params
        }
      ]
    }
  }

  constructor( 
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
      'See also https://github.com/angular/angular/issues/20575');
    }
  }
}
