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
import { RegisterService } from './services/register.service';
import { InviteService } from './services/invite.service';
import { PhotoService } from './services/photo.service';
import { FileService } from './services/file.service';
import { FileExplorerService } from './services/file-explorer.service';
import { VideoService } from './services/video.service';
import { ApplicationService } from './services/application.service';
import { DomainService } from './services/domain.service';
import { ContactsService } from './services/contacts.service';
import { ChamadaService } from './services/chamada.service';
import { ConversationService } from './services/conversation.service';
import { ProductService } from './services/product.service';
import { PranchetaService } from './services/prancheta.service';
import { UserService } from './services/user.service';
import { CategoryService } from './services/category.service';
import { CadastroService } from './services/cadastro.service';
import { EnderecoService } from './services/endereco.service';
import { InformacaoContatoService } from './services/informacao-contato.service';
import { PessoaService } from './services/pessoa.service';
import { UnidadeMedidaService } from './services/unidade-medida.service';
import { PaisService } from './services/pais.service';
import { LancamentoFinanceiroService } from './services/lancamento-financeiro.service';
import { I11NService } from './services/i-11-n.service';
import { OrganizacaoService } from './services/organizacao.service';
import { FormsService } from './services/forms.service';
import { WebsiteService } from './services/website.service';
import { SitePageService } from './services/site-page.service';
import { CommentMetaService } from './services/comment-meta.service';
import { CommentService } from './services/comment.service';
import { LinksService } from './services/links.service';
import { SiteOptionService } from './services/site-option.service';
import { SitePostService } from './services/site-post.service';
import { TermService } from './services/term.service';
import { TermMetaService } from './services/term-meta.service';
import { ProjetoService } from './services/projeto.service';
import { ClienteProjetoService } from './services/cliente-projeto.service';
import { WorkItemService } from './services/work-item.service';
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
import { DeployerService } from './services/deployer.service';
import { ChessService } from './services/chess.service';
import { GameplayService } from './services/gameplay.service';
import { ChangelogService } from './services/changelog.service';

export function getServiceAsSchema(schema: string): Type<any>{
  return ({ 'ApiService': ApiService,'SystemService': SystemService,'DeviceService': DeviceService,'MessageService': MessageService,'AuthService': AuthService,'RegisterService': RegisterService,'InviteService': InviteService,'PhotoService': PhotoService,'FileService': FileService,'FileExplorerService': FileExplorerService,'VideoService': VideoService,'ApplicationService': ApplicationService,'DomainService': DomainService,'ContactsService': ContactsService,'ChamadaService': ChamadaService,'ConversationService': ConversationService,'ProductService': ProductService,'PranchetaService': PranchetaService,'UserService': UserService,'CategoryService': CategoryService,'CadastroService': CadastroService,'EnderecoService': EnderecoService,'InformacaoContatoService': InformacaoContatoService,'PessoaService': PessoaService,'UnidadeMedidaService': UnidadeMedidaService,'PaisService': PaisService,'LancamentoFinanceiroService': LancamentoFinanceiroService,'I11NService': I11NService,'OrganizacaoService': OrganizacaoService,'FormsService': FormsService,'WebsiteService': WebsiteService,'SitePageService': SitePageService,'CommentMetaService': CommentMetaService,'CommentService': CommentService,'LinksService': LinksService,'SiteOptionService': SiteOptionService,'SitePostService': SitePostService,'TermService': TermService,'TermMetaService': TermMetaService,'ProjetoService': ProjetoService,'ClienteProjetoService': ClienteProjetoService,'WorkItemService': WorkItemService,'VendaProdutoService': VendaProdutoService,'ServicoService': ServicoService,'PromocaoService': PromocaoService,'ProfissionalService': ProfissionalService,'ProdutoService': ProdutoService,'PagamentoService': PagamentoService,'HistoricoContatoService': HistoricoContatoService,'ClienteCrmService': ClienteCrmService,'AtendimentoService': AtendimentoService,'AgendamentoService': AgendamentoService,'DeployerService': DeployerService,'ChessService': ChessService,'GameplayService': GameplayService,'ChangelogService': ChangelogService, }[ schema + 'Service'] as any) || undefined;
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
        RegisterService,
        InviteService,
        PhotoService,
        FileService,
        FileExplorerService,
        VideoService,
        ApplicationService,
        DomainService,
        ContactsService,
        ChamadaService,
        ConversationService,
        ProductService,
        PranchetaService,
        UserService,
        CategoryService,
        CadastroService,
        EnderecoService,
        InformacaoContatoService,
        PessoaService,
        UnidadeMedidaService,
        PaisService,
        LancamentoFinanceiroService,
        I11NService,
        OrganizacaoService,
        FormsService,
        WebsiteService,
        SitePageService,
        CommentMetaService,
        CommentService,
        LinksService,
        SiteOptionService,
        SitePostService,
        TermService,
        TermMetaService,
        ProjetoService,
        ClienteProjetoService,
        WorkItemService,
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
        DeployerService,
        ChessService,
        GameplayService,
        ChangelogService,
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
