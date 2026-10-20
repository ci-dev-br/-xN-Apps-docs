/* tslint:disable */
/* eslint-disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { ApiService } from './services/api.service';
import { LoggerService } from './services/logger.service';
import { SystemService } from './services/system.service';
import { DeviceService } from './services/device.service';
import { MessageService } from './services/message.service';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { RegisterService } from './services/register.service';
import { InviteService } from './services/invite.service';
import { TenantService } from './services/tenant.service';
import { PhotoService } from './services/photo.service';
import { FileService } from './services/file.service';
import { FileExplorerService } from './services/file-explorer.service';
import { VideoService } from './services/video.service';
import { ApplicationService } from './services/application.service';
import { DomainService } from './services/domain.service';
import { LancamentoFinanceiroService } from './services/lancamento-financeiro.service';
import { AnaliseFundamentalistaService } from './services/analise-fundamentalista.service';
import { AnaliseMacroeconomicaService } from './services/analise-macroeconomica.service';
import { IndicadoresMacroeconomicosService } from './services/indicadores-macroeconomicos.service';
import { DadosFundamentalistasCvmService } from './services/dados-fundamentalistas-cvm.service';
import { CarteiraService } from './services/carteira.service';
import { CotacoesB3Service } from './services/cotacoes-b-3.service';
import { I11NService } from './services/i-11-n.service';
import { CategoryService } from './services/category.service';
import { CadastroService } from './services/cadastro.service';
import { EnderecoService } from './services/endereco.service';
import { InformacaoContatoService } from './services/informacao-contato.service';
import { PessoaService } from './services/pessoa.service';
import { UnidadeMedidaService } from './services/unidade-medida.service';
import { PaisService } from './services/pais.service';
import { DocumentoIdentificacaoService } from './services/documento-identificacao.service';
import { TipoDocumentoIdentificacaoService } from './services/tipo-documento-identificacao.service';
import { ContactsService } from './services/contacts.service';
import { ChamadaService } from './services/chamada.service';
import { ConversationService } from './services/conversation.service';
import { MessagerService } from './services/messager.service';
import { ProductService } from './services/product.service';
import { CodexService } from './services/codex.service';
import { PranchetaService } from './services/prancheta.service';
import { UserService } from './services/user.service';
import { SocialService } from './services/social.service';
import { NotasFiscaisService } from './services/notas-fiscais.service';
import { OrganizacaoService } from './services/organizacao.service';
import { NewsService } from './services/news.service';
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
import { KeyboardThemesService } from './services/keyboard-themes.service';
import { ChangelogService } from './services/changelog.service';

export function getServiceAsSchema(schema: string): Type<any>{
  return ({ 'ApiService': ApiService,'LoggerService': LoggerService,'SystemService': SystemService,'DeviceService': DeviceService,'MessageService': MessageService,'NotificationService': NotificationService,'AuthService': AuthService,'RegisterService': RegisterService,'InviteService': InviteService,'TenantService': TenantService,'PhotoService': PhotoService,'FileService': FileService,'FileExplorerService': FileExplorerService,'VideoService': VideoService,'ApplicationService': ApplicationService,'DomainService': DomainService,'LancamentoFinanceiroService': LancamentoFinanceiroService,'AnaliseFundamentalistaService': AnaliseFundamentalistaService,'AnaliseMacroeconomicaService': AnaliseMacroeconomicaService,'IndicadoresMacroeconomicosService': IndicadoresMacroeconomicosService,'DadosFundamentalistasCvmService': DadosFundamentalistasCvmService,'CarteiraService': CarteiraService,'CotacoesB3Service': CotacoesB3Service,'I11NService': I11NService,'CategoryService': CategoryService,'CadastroService': CadastroService,'EnderecoService': EnderecoService,'InformacaoContatoService': InformacaoContatoService,'PessoaService': PessoaService,'UnidadeMedidaService': UnidadeMedidaService,'PaisService': PaisService,'DocumentoIdentificacaoService': DocumentoIdentificacaoService,'TipoDocumentoIdentificacaoService': TipoDocumentoIdentificacaoService,'ContactsService': ContactsService,'ChamadaService': ChamadaService,'ConversationService': ConversationService,'MessagerService': MessagerService,'ProductService': ProductService,'CodexService': CodexService,'PranchetaService': PranchetaService,'UserService': UserService,'SocialService': SocialService,'NotasFiscaisService': NotasFiscaisService,'OrganizacaoService': OrganizacaoService,'NewsService': NewsService,'FormsService': FormsService,'WebsiteService': WebsiteService,'SitePageService': SitePageService,'CommentMetaService': CommentMetaService,'CommentService': CommentService,'LinksService': LinksService,'SiteOptionService': SiteOptionService,'SitePostService': SitePostService,'TermService': TermService,'TermMetaService': TermMetaService,'ProjetoService': ProjetoService,'ClienteProjetoService': ClienteProjetoService,'WorkItemService': WorkItemService,'VendaProdutoService': VendaProdutoService,'ServicoService': ServicoService,'PromocaoService': PromocaoService,'ProfissionalService': ProfissionalService,'ProdutoService': ProdutoService,'PagamentoService': PagamentoService,'HistoricoContatoService': HistoricoContatoService,'ClienteCrmService': ClienteCrmService,'AtendimentoService': AtendimentoService,'AgendamentoService': AgendamentoService,'DeployerService': DeployerService,'ChessService': ChessService,'GameplayService': GameplayService,'KeyboardThemesService': KeyboardThemesService,'ChangelogService': ChangelogService, }[ schema + 'Service'] as any) || undefined;
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
        LoggerService,
        SystemService,
        DeviceService,
        MessageService,
        NotificationService,
        AuthService,
        RegisterService,
        InviteService,
        TenantService,
        PhotoService,
        FileService,
        FileExplorerService,
        VideoService,
        ApplicationService,
        DomainService,
        LancamentoFinanceiroService,
        AnaliseFundamentalistaService,
        AnaliseMacroeconomicaService,
        IndicadoresMacroeconomicosService,
        DadosFundamentalistasCvmService,
        CarteiraService,
        CotacoesB3Service,
        I11NService,
        CategoryService,
        CadastroService,
        EnderecoService,
        InformacaoContatoService,
        PessoaService,
        UnidadeMedidaService,
        PaisService,
        DocumentoIdentificacaoService,
        TipoDocumentoIdentificacaoService,
        ContactsService,
        ChamadaService,
        ConversationService,
        MessagerService,
        ProductService,
        CodexService,
        PranchetaService,
        UserService,
        SocialService,
        NotasFiscaisService,
        OrganizacaoService,
        NewsService,
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
        KeyboardThemesService,
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
