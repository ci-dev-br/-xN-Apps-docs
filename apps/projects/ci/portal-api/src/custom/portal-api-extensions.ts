import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StrictHttpResponse } from '../lib/strict-http-response';
import { User } from '../lib/models/user';
import { News } from '../lib/models/news';
import { AuthService } from '../lib/services/auth.service';
import { NewsService } from '../lib/services/news.service';
import { CarteiraService } from '../lib/services/carteira.service';
import { FileExplorerService } from '../lib/services/file-explorer.service';
import { OrganizacaoService } from '../lib/services/organizacao.service';
import { Organizacao } from '../lib/models/organizacao';
import { GetMarketNews$Params } from '../lib/fn/news/get-market-news';

export interface ConnectedDevice {
  id: string;
  ip?: string;
  browser?: string;
  os?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  createdAt?: string | Date;
  isCurrent?: boolean;
  isOnline?: boolean;
}

export interface ParametrosLastroDto {
  indexador?: string;
  casasDecimais?: number;
  permiteSaldoNegativo?: boolean;
  emissor?: string;
  observacoesLastro?: string;
  metaPosicao?: number;
}

export interface CarteiraDto {
  internalId?: string;
  userId?: string;
  nome?: string;
  descricao?: string;
  numeroCarteira: string;
  saldo: number;
  saldoBloqueado?: number;
  tipoLastro?: 'MOEDA_REAL' | 'PARAMETRIZADA';
  moeda: string;
  simboloMoeda?: string;
  nomeMoeda?: string;
  fatorConversaoBrl?: number;
  parametrosLastro?: ParametrosLastroDto;
  principal?: boolean;
  corTema?: string;
  ativa?: boolean;
  status?: string;
  limiteDiario?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoriaTransacaoCarteira =
  | 'DEPOSITO'
  | 'PAGAMENTO_FATURA'
  | 'TRANSFERENCIA'
  | 'ESTORNO'
  | 'AJUSTE_POSICAO'
  | 'RENDIMENTO'
  | 'APORTE'
  | 'RETIRADA'
  | 'VALORIZACAO'
  | 'OUTROS';

export interface TransacaoCarteiraDto {
  internalId?: string;
  carteiraId?: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: CategoriaTransacaoCarteira;
  valor: number;
  saldoAnterior?: number;
  saldoPosterior?: number;
  descricao?: string;
  identificador?: string;
  referenciaFaturaId?: string;
  status: 'CONCLUIDA' | 'PENDENTE' | 'CANCELADA';
  createdAt?: string;
  metadados?: any;
}

export type PeriodoDashboardCarteira = '7D' | '30D' | '90D' | '12M' | 'TUDO';

export interface PontoSerieTemporalCarteiraDto {
  indice: number;
  dataIso: string;
  rotulo: string;
  descricaoEvento: string;
  patrimonioBrl: number;
  ganhosBrl: number;
  perdasBrl: number;
  resultadoLiquidoBrl: number;
  ganhoAcumuladoBrl: number;
  variacaoPercentualAcumulada: number;
}

export interface DesempenhoCarteiraItemDto {
  carteiraId: string;
  nome: string;
  numeroCarteira: string;
  moeda: string;
  simboloMoeda: string;
  nomeMoeda: string;
  tipoLastro: 'MOEDA_REAL' | 'PARAMETRIZADA';
  corTema: string;
  principal: boolean;
  saldoAtual: number;
  fatorConversaoBrl: number;
  saldoAtualBrl: number;
  participacaoPercentual: number;
  ganhosPeriodoMoeda: number;
  perdasPeriodoMoeda: number;
  resultadoLiquidoMoeda: number;
  ganhosPeriodoBrl: number;
  perdasPeriodoBrl: number;
  resultadoLiquidoBrl: number;
  rentabilidadePercentual: number;
  metaPosicao: number | null;
  progressoMetaPercentual: number | null;
  totalTransacoes: number;
}

export interface ResumoDashboardCarteiraDto {
  patrimonioTotalBrl: number;
  patrimonioMoedaRealBrl: number;
  patrimonioParametrizadoBrl: number;
  percentualMoedaReal: number;
  percentualParametrizado: number;
  ganhosTotaisPeriodoBrl: number;
  perdasTotaisPeriodoBrl: number;
  resultadoLiquidoPeriodoBrl: number;
  variacaoPercentualPeriodo: number;
  ganhosRendimentosValorizacaoBrl: number;
  aportesDepositosBrl: number;
  retiradasPagamentosBrl: number;
  totalMovimentacoesPeriodo: number;
  eventosPositivos: number;
  eventosNegativos: number;
  melhorCarteira: {
    carteiraId: string;
    nome: string;
    moeda: string;
    simboloMoeda: string;
    resultadoLiquidoBrl: number;
    rentabilidadePercentual: number;
  } | null;
}

export interface DashboardCarteirasDto {
  periodo: PeriodoDashboardCarteira;
  escopoCarteiraId: string | 'TODAS';
  resumo: ResumoDashboardCarteiraDto;
  desempenhoCarteiras: DesempenhoCarteiraItemDto[];
  serieTemporal: PontoSerieTemporalCarteiraDto[];
}

export interface VisaoGeralCarteiraDto {
  possuiCarteira?: boolean;
  carteira?: CarteiraDto | null;
  carteiras?: CarteiraDto[];
  patrimonioTotalBrl?: number;
  transacoesRecentes: TransacaoCarteiraDto[];
  dashboard?: DashboardCarteirasDto;
}

export interface CriarCarteiraPayloadDto {
  nome?: string;
  descricao?: string;
  tipoLastro?: 'MOEDA_REAL' | 'PARAMETRIZADA';
  moeda?: string;
  simboloMoeda?: string;
  nomeMoeda?: string;
  fatorConversaoBrl?: number;
  saldoInicial?: number;
  limiteDiario?: number;
  principal?: boolean;
  corTema?: string;
  parametrosLastro?: ParametrosLastroDto;
  termosAceitos?: boolean;
}

export interface LancamentoPosicaoPayloadDto {
  carteiraId?: string;
  modo: 'MOVIMENTACAO' | 'DEFINIR_POSICAO';
  tipo?: 'ENTRADA' | 'SAIDA';
  valor?: number;
  novaPosicao?: number;
  novaCotacaoBrl?: number;
  novaMetaPosicao?: number;
  categoria?: CategoriaTransacaoCarteira;
  identificador?: string;
  descricao?: string;
  metadados?: any;
}

export interface NewsSocialStatus {
  tipo?: 'SELF' | 'CONHECIDO' | 'SEGUINDO' | 'SEGUIDOR' | 'NENHUM' | string;
  isFollowing?: boolean;
  isFollower?: boolean;
  isConhecido?: boolean;
}

export interface NewsCommentItem {
  id: string;
  newsId?: string;
  content: string;
  createdAt?: string | Date;
  user?: User | any;
  socialStatus?: NewsSocialStatus;
}

export interface NewsVoteStats {
  newsId?: string;
  upVotes: number;
  downVotes: number;
  userVote?: 'UP' | 'DOWN' | null;
}

declare module '../lib/models/news' {
  export interface News {
    categoria?: string;
    category?: { id?: string; name?: string; is_trending?: boolean } | null;
    sourceInfo?: { id?: string; name?: string; domain?: string; searchUrlTemplate?: string } | null;
    scrapedAt?: string | Date;
    upVotes?: number;
    downVotes?: number;
    commentsCount?: number;
    userVote?: 'UP' | 'DOWN' | null;
    correlationScore?: number;
    matchedTerm?: string;
    matchedSnippet?: string;
  }
}

declare module '../lib/models/sync-payload-dao' {
  export interface SyncPayloadDao {
    id?: string | null;
    [key: string]: any;
  }
}

declare module '../lib/services/auth.service' {
  export interface AuthService {
    dispositivos(context?: HttpContext): Observable<ConnectedDevice[]>;
  }
}

declare module '../lib/services/news.service' {
  export interface NewsService {
    getOrCreateAnonymousId(): string;
    getAnonymousAuthorName(): string;
    setAnonymousAuthorName(name: string): void;
    initAnonymousSession(authorName?: string, context?: HttpContext): Observable<{
      isAnonymous: boolean;
      anonymousId: string;
      user: { id: string; username: string; fullName: string; surname: string; roles: string[] } | null;
    }>;
    getMarketNews(params?: { search?: string; category?: string; limit?: number; offset?: number } | GetMarketNews$Params, context?: HttpContext): Observable<Array<News>>;
    getCorrelatedNews(params: { newsId?: string; phrase?: string; title?: string; content?: string; limit?: number }, context?: HttpContext): Observable<Array<News>>;
    vote(newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<NewsVoteStats>;
    getVoteStats(newsId: string, context?: HttpContext): Observable<NewsVoteStats>;
    comment(newsId: string, content: string, authorName?: string, context?: HttpContext): Observable<NewsCommentItem>;
    getComments(newsId: string, context?: HttpContext): Observable<Array<NewsCommentItem>>;
    followUser(userId: string, context?: HttpContext): Observable<any>;
    unfollowUser(userId: string, context?: HttpContext): Observable<{ success: boolean }>;
    getSocialStatus(userId: string, context?: HttpContext): Observable<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }>;
  }
}

export interface RequestFilePermissionInput {
  path: string;
  reason?: string;
  originUrl?: string;
}

export interface RequestFilePermissionOutput {
  requested: boolean;
  alreadyAuthorized?: boolean;
  path: string;
  status?: string;
  requestToken?: string;
  emailsSent?: number;
  sysadminCount?: number;
  authorizeLink?: string;
  message?: string;
}

export interface AuthorizeFilePermissionInput {
  token?: string;
  internalId?: string;
  decision?: 'GRANT' | 'DENY';
}

export interface AuthorizeFilePermissionOutput {
  authorized: boolean;
  denied?: boolean;
  path?: string;
  status?: string;
  requestedByUserId?: string;
  requestedByEmail?: string;
  message?: string;
}

export interface FilePermissionItem {
  internalId?: string;
  role?: string;
  status?: string;
  path?: string;
  requestedByUserId?: string;
  requestedByEmail?: string;
  requestedByName?: string;
  reason?: string;
  authorizedAt?: string | Date;
  createdAt?: string | Date;
}

export interface MyFilePermissionsOutput {
  authorizedPaths: string[];
  permissions: FilePermissionItem[];
  pendingRequests: FilePermissionItem[];
}

declare module '../lib/services/file-explorer.service' {
  export interface FileExplorerService {
    requestPermission(body: RequestFilePermissionInput, context?: HttpContext): Observable<RequestFilePermissionOutput>;
    authorizePermission(body: AuthorizeFilePermissionInput, context?: HttpContext): Observable<AuthorizeFilePermissionOutput>;
    getPermissionRequest(token: string, context?: HttpContext): Observable<FilePermissionItem>;
    myPermissions(context?: HttpContext): Observable<MyFilePermissionsOutput>;
  }
}

export interface OrganizacaoRoleDto {
  internalId?: string;
  organizacaoId: string;
  code: string;
  customName: string;
  description?: string;
  createdAt?: string | Date;
}

export interface OrganizacaoMembroDto {
  internalId?: string;
  organizacaoId: string;
  tenantId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  isOwner?: boolean;
  roles: string[];
  status: 'ACTIVE' | 'INVITED' | 'REMOVED';
  createdAt?: string | Date;
}

export interface OrganizacaoResumoDto extends Organizacao {
  description?: string | null;
  cnpj?: string | null;
  website?: string | null;
  ownerUserId?: string | null;
  tenantId?: string | null;
  isOwner?: boolean;
  myRoles?: string[];
  membersCount?: number;
  rolesCount?: number;
}

export interface OrganizacaoDetalhesDto extends OrganizacaoResumoDto {
  members?: OrganizacaoMembroDto[];
  orgRoles?: OrganizacaoRoleDto[];
}

export interface OrganizacaoUsuarioBuscaDto {
  id: string;
  username?: string;
  fullName?: string;
  surname?: string;
  email?: string;
}

export interface CriarOrganizacaoPayloadDto {
  organizatioName: string;
  description?: string;
  cnpj?: string;
  website?: string;
}

export interface CompartilharOrganizacaoPayloadDto {
  userId?: string;
  emailOrUsername?: string;
  roles?: string[];
}

declare module '../lib/services/organizacao.service' {
  export interface OrganizacaoService {
    minhasOrganizacoes(context?: HttpContext): Observable<OrganizacaoResumoDto[]>;
    criarOrganizacao(body: CriarOrganizacaoPayloadDto, context?: HttpContext): Observable<OrganizacaoDetalhesDto>;
    atualizarOrganizacao(id: string, body: Partial<CriarOrganizacaoPayloadDto>, context?: HttpContext): Observable<OrganizacaoDetalhesDto>;
    obterDetalhes(id: string, context?: HttpContext): Observable<OrganizacaoDetalhesDto>;
    buscarUsuarios(search?: string, context?: HttpContext): Observable<OrganizacaoUsuarioBuscaDto[]>;
    listarRoles(id: string, context?: HttpContext): Observable<OrganizacaoRoleDto[]>;
    criarRole(id: string, body: { name: string; description?: string }, context?: HttpContext): Observable<OrganizacaoRoleDto>;
    removerRole(id: string, roleId: string, context?: HttpContext): Observable<{ removed: boolean; code?: string }>;
    listarMembros(id: string, context?: HttpContext): Observable<OrganizacaoMembroDto[]>;
    compartilharComUsuario(id: string, body: CompartilharOrganizacaoPayloadDto, context?: HttpContext): Observable<OrganizacaoMembroDto>;
    atribuirRolesMembro(id: string, memberId: string, roles: string[], context?: HttpContext): Observable<OrganizacaoMembroDto>;
    removerMembro(id: string, memberId: string, context?: HttpContext): Observable<{ removed: boolean }>;
  }
}

declare module '../lib/services/carteira.service' {
  export interface CarteiraService {
    obterMinhaCarteira(autoCreate?: boolean, carteiraId?: string, periodo?: PeriodoDashboardCarteira): Observable<VisaoGeralCarteiraDto>;
    obterDashboardCarteiras(periodo?: PeriodoDashboardCarteira, carteiraId?: string): Observable<DashboardCarteirasDto>;
    listarCarteiras(): Observable<{ possuiCarteira: boolean; carteiras: CarteiraDto[] }>;
    criarCarteira(dados?: CriarCarteiraPayloadDto): Observable<{
      possuiCarteira: boolean;
      carteira: CarteiraDto;
      carteiras?: CarteiraDto[];
      criada: boolean;
    }>;
    lancarPosicaoCarteira(dados: LancamentoPosicaoPayloadDto): Observable<{
      carteira: CarteiraDto;
      transacao: TransacaoCarteiraDto;
      carteiras: CarteiraDto[];
      patrimonioTotalBrl: number;
    }>;
    registrarDeposito(dados: {
      carteiraId?: string;
      valor: number;
      identificador?: string;
      descricao?: string;
      metadados?: any;
    }): Observable<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }>;
    pagarFatura(dados: {
      carteiraId?: string;
      faturaId: string;
      valor: number;
      descricao?: string;
      metadados?: any;
    }): Observable<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }>;
    listarTransacoes(params?: {
      carteiraId?: string;
      tipo?: 'ENTRADA' | 'SAIDA';
      categoria?: string;
      de?: string;
      ate?: string;
      pagina?: number;
      limite?: number;
    }): Observable<{ itens: TransacaoCarteiraDto[]; total: number; pagina: number }>;
    avaliarRoleDeveloper(): Observable<{
      promovido: boolean;
      motivo: string;
      user?: { id: string; email: string; roles: string[]; emailVerificado: boolean };
      saldoAtual?: number;
    }>;
  }
}

type ServiceCtx = { http: HttpClient; rootUrl: string; [key: string]: any };

// Runtime prototype augmentations for AuthService
AuthService.prototype.dispositivos = function (this: ServiceCtx, context?: HttpContext): Observable<ConnectedDevice[]> {
  return this.http.post<ConnectedDevice[]>(`${this.rootUrl}/auth/Dispositivos`, {}, { context });
};

(AuthService.prototype as any).desconectarDispositivo = function (this: ServiceCtx, params?: any, context?: HttpContext): Observable<any> {
  if (typeof params === 'string') {
    return this.http.post<{ success: boolean; isCurrent?: boolean }>(
      `${this.rootUrl}/auth/DesconectarDispositivo`,
      { chaveAcesso: params },
      { context }
    );
  }
  return this['desconectarDispositivo$Response'](params, context).pipe(
    map((r: StrictHttpResponse<void>): void => r.body)
  );
};

(AuthService.prototype as any).desconectarOutrosDispositivos = function (this: ServiceCtx, params?: any, context?: HttpContext): Observable<any> {
  if (!params || params instanceof HttpContext) {
    return this.http.post<{ success: boolean }>(
      `${this.rootUrl}/auth/DesconectarOutrosDispositivos`,
      {},
      { context: params instanceof HttpContext ? params : context }
    );
  }
  return this['desconectarOutrosDispositivos$Response'](params, context).pipe(
    map((r: StrictHttpResponse<void>): void => r.body)
  );
};

// Runtime prototype augmentations for NewsService
NewsService.prototype.getOrCreateAnonymousId = function (): string {
  try {
    if (typeof localStorage !== 'undefined') {
      let anonId = localStorage.getItem('ci_anonymous_client_id');
      if (!anonId || anonId.length < 8) {
        const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        anonId = `anon-${rand}`;
        localStorage.setItem('ci_anonymous_client_id', anonId);
      }
      return anonId;
    }
  } catch { }
  return 'anon-session-default';
};

NewsService.prototype.getAnonymousAuthorName = function (): string {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('ci_anonymous_author_name') || '';
    }
  } catch { }
  return '';
};

NewsService.prototype.setAnonymousAuthorName = function (name: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ci_anonymous_author_name', (name || '').trim());
    }
  } catch { }
};

NewsService.prototype.initAnonymousSession = function (this: ServiceCtx, authorName?: string, context?: HttpContext): Observable<any> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  if (authorName !== undefined) {
    NewsService.prototype.setAnonymousAuthorName.call(this, authorName);
  }
  const savedName = authorName !== undefined ? authorName : NewsService.prototype.getAnonymousAuthorName.call(this);
  return this.http.post<any>(
    `${this.rootUrl}/News/AnonymousSession`,
    { anonymousId, authorName: savedName || undefined },
    { headers: { 'x-anonymous-id': anonymousId }, context }
  );
};

NewsService.prototype.getMarketNews = function (
  this: ServiceCtx,
  params?: { search?: string; category?: string; limit?: number; offset?: number },
  context?: HttpContext
): Observable<Array<News>> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  const queryParams: string[] = [`anonymousId=${encodeURIComponent(anonymousId)}`];
  if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.category) queryParams.push(`category=${encodeURIComponent(params.category)}`);
  if (params?.limit !== undefined) queryParams.push(`limit=${params.limit}`);
  if (params?.offset !== undefined) queryParams.push(`offset=${params.offset}`);
  const qs = queryParams.length ? `?${queryParams.join('&')}` : '';
  return this.http.get<Array<News>>(`${this.rootUrl}/News/Market${qs}`, {
    headers: { 'x-anonymous-id': anonymousId },
    context
  });
};

NewsService.prototype.getCorrelatedNews = function (
  this: ServiceCtx,
  params: { newsId?: string; phrase?: string; title?: string; content?: string; limit?: number },
  context?: HttpContext
): Observable<Array<News>> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  return this.http.post<Array<News>>(
    `${this.rootUrl}/News/Correlated`,
    params || {},
    { headers: { 'x-anonymous-id': anonymousId }, context }
  );
};

NewsService.prototype.vote = function (this: ServiceCtx, newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<NewsVoteStats> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  return this.http.post<NewsVoteStats>(
    `${this.rootUrl}/News/Vote`,
    { newsId, vote, anonymousId },
    { headers: { 'x-anonymous-id': anonymousId }, context }
  );
};

NewsService.prototype.getVoteStats = function (this: ServiceCtx, newsId: string, context?: HttpContext): Observable<NewsVoteStats> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  return this.http.get<NewsVoteStats>(
    `${this.rootUrl}/News/VoteStats/${encodeURIComponent(newsId)}?anonymousId=${encodeURIComponent(anonymousId)}`,
    { headers: { 'x-anonymous-id': anonymousId }, context }
  );
};

NewsService.prototype.comment = function (this: ServiceCtx, newsId: string, content: string, authorName?: string, context?: HttpContext): Observable<NewsCommentItem> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  if (authorName && authorName.trim()) {
    NewsService.prototype.setAnonymousAuthorName.call(this, authorName.trim());
  }
  const resolvedAuthorName = (authorName?.trim() || NewsService.prototype.getAnonymousAuthorName.call(this)) || undefined;
  return this.http.post<NewsCommentItem>(
    `${this.rootUrl}/News/Comment`,
    { newsId, content, anonymousId, authorName: resolvedAuthorName },
    { headers: { 'x-anonymous-id': anonymousId }, context }
  );
};

NewsService.prototype.getComments = function (this: ServiceCtx, newsId: string, context?: HttpContext): Observable<Array<NewsCommentItem>> {
  const anonymousId = NewsService.prototype.getOrCreateAnonymousId.call(this);
  return this.http.get<Array<NewsCommentItem>>(
    `${this.rootUrl}/News/Comments/${encodeURIComponent(newsId)}?anonymousId=${encodeURIComponent(anonymousId)}`,
    { headers: { 'x-anonymous-id': anonymousId }, context }
  );
};

NewsService.prototype.followUser = function (this: ServiceCtx, userId: string, context?: HttpContext): Observable<any> {
  return this.http.post<any>(`${this.rootUrl}/Social/Follow/${userId}`, {}, { context });
};

NewsService.prototype.unfollowUser = function (this: ServiceCtx, userId: string, context?: HttpContext): Observable<{ success: boolean }> {
  return this.http.post<{ success: boolean }>(`${this.rootUrl}/Social/Unfollow/${userId}`, {}, { context });
};

NewsService.prototype.getSocialStatus = function (
  this: ServiceCtx,
  userId: string,
  context?: HttpContext
): Observable<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }> {
  return this.http.get<any>(`${this.rootUrl}/Social/Status/${userId}`, { context });
};

// Runtime prototype augmentations for CarteiraService
CarteiraService.prototype.obterMinhaCarteira = function (
  this: ServiceCtx,
  autoCreate?: boolean,
  carteiraId?: string,
  periodo?: PeriodoDashboardCarteira
): Observable<VisaoGeralCarteiraDto> {
  const params: string[] = [];
  if (autoCreate) params.push('autoCreate=true');
  if (carteiraId) params.push(`carteiraId=${encodeURIComponent(carteiraId)}`);
  if (periodo) params.push(`periodo=${encodeURIComponent(periodo)}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  return this.http.get<VisaoGeralCarteiraDto>(`${this.rootUrl}/Financeiro/Carteira/Minha${qs}`);
};

CarteiraService.prototype.obterDashboardCarteiras = function (
  this: ServiceCtx,
  periodo?: PeriodoDashboardCarteira,
  carteiraId?: string
): Observable<DashboardCarteirasDto> {
  const params: string[] = [];
  if (periodo) params.push(`periodo=${encodeURIComponent(periodo)}`);
  if (carteiraId) params.push(`carteiraId=${encodeURIComponent(carteiraId)}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  return this.http.get<DashboardCarteirasDto>(`${this.rootUrl}/Financeiro/Carteira/Dashboard${qs}`);
};

CarteiraService.prototype.listarCarteiras = function (this: ServiceCtx): Observable<{ possuiCarteira: boolean; carteiras: CarteiraDto[] }> {
  return this.http.get<{ possuiCarteira: boolean; carteiras: CarteiraDto[] }>(`${this.rootUrl}/Financeiro/Carteira/Listar`);
};

CarteiraService.prototype.criarCarteira = function (
  this: ServiceCtx,
  dados?: CriarCarteiraPayloadDto
): Observable<{ possuiCarteira: boolean; carteira: CarteiraDto; carteiras?: CarteiraDto[]; criada: boolean }> {
  return this.http.post<{ possuiCarteira: boolean; carteira: CarteiraDto; carteiras?: CarteiraDto[]; criada: boolean }>(
    `${this.rootUrl}/Financeiro/Carteira/Criar`,
    dados || {}
  );
};

CarteiraService.prototype.lancarPosicaoCarteira = function (
  this: ServiceCtx,
  dados: LancamentoPosicaoPayloadDto
): Observable<{
  carteira: CarteiraDto;
  transacao: TransacaoCarteiraDto;
  carteiras: CarteiraDto[];
  patrimonioTotalBrl: number;
}> {
  return this.http.post<{
    carteira: CarteiraDto;
    transacao: TransacaoCarteiraDto;
    carteiras: CarteiraDto[];
    patrimonioTotalBrl: number;
  }>(`${this.rootUrl}/Financeiro/Carteira/LancamentoPosicao`, dados);
};

CarteiraService.prototype.registrarDeposito = function (
  this: ServiceCtx,
  dados: { carteiraId?: string; valor: number; identificador?: string; descricao?: string; metadados?: any }
): Observable<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }> {
  return this.http.post<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }>(
    `${this.rootUrl}/Financeiro/Carteira/Deposito`,
    dados
  );
};

CarteiraService.prototype.pagarFatura = function (
  this: ServiceCtx,
  dados: { carteiraId?: string; faturaId: string; valor: number; descricao?: string; metadados?: any }
): Observable<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }> {
  return this.http.post<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }>(
    `${this.rootUrl}/Financeiro/Carteira/PagarFatura`,
    dados
  );
};

CarteiraService.prototype.listarTransacoes = function (
  this: ServiceCtx,
  params?: { tipo?: 'ENTRADA' | 'SAIDA'; categoria?: string; de?: string; ate?: string; pagina?: number; limite?: number }
): Observable<{ itens: TransacaoCarteiraDto[]; total: number; pagina: number }> {
  let httpParams = new HttpParams();
  if (params?.tipo) httpParams = httpParams.set('tipo', params.tipo);
  if (params?.categoria) httpParams = httpParams.set('categoria', params.categoria);
  if (params?.de) httpParams = httpParams.set('de', params.de);
  if (params?.ate) httpParams = httpParams.set('ate', params.ate);
  if (params?.pagina) httpParams = httpParams.set('pagina', params.pagina.toString());
  if (params?.limite) httpParams = httpParams.set('limite', params.limite.toString());

  return this.http.get<{ itens: TransacaoCarteiraDto[]; total: number; pagina: number }>(
    `${this.rootUrl}/Financeiro/Carteira/Transacoes`,
    { params: httpParams }
  );
};

CarteiraService.prototype.avaliarRoleDeveloper = function (this: ServiceCtx): Observable<{
  promovido: boolean;
  motivo: string;
  user?: { id: string; email: string; roles: string[]; emailVerificado: boolean };
  saldoAtual?: number;
}> {
  return this.http.post<{
    promovido: boolean;
    motivo: string;
    user?: { id: string; email: string; roles: string[]; emailVerificado: boolean };
    saldoAtual?: number;
  }>(`${this.rootUrl}/Financeiro/Carteira/AvaliarRoleDeveloper`, {});
};

// Runtime prototype augmentations for FileExplorerService
FileExplorerService.prototype.requestPermission = function (
  this: ServiceCtx,
  body: RequestFilePermissionInput,
  context?: HttpContext
): Observable<RequestFilePermissionOutput> {
  const originUrl = body?.originUrl || (typeof window !== 'undefined' ? window.location.origin : undefined);
  return this.http.post<RequestFilePermissionOutput>(
    `${this.rootUrl}/FileExplorer/RequestPermission`,
    { ...body, originUrl },
    { context }
  );
};

FileExplorerService.prototype.authorizePermission = function (
  this: ServiceCtx,
  body: AuthorizeFilePermissionInput,
  context?: HttpContext
): Observable<AuthorizeFilePermissionOutput> {
  return this.http.post<AuthorizeFilePermissionOutput>(
    `${this.rootUrl}/FileExplorer/AuthorizePermission`,
    body || {},
    { context }
  );
};

FileExplorerService.prototype.getPermissionRequest = function (
  this: ServiceCtx,
  token: string,
  context?: HttpContext
): Observable<FilePermissionItem> {
  return this.http.post<FilePermissionItem>(
    `${this.rootUrl}/FileExplorer/GetPermissionRequest`,
    { token },
    { context }
  );
};

FileExplorerService.prototype.myPermissions = function (
  this: ServiceCtx,
  context?: HttpContext
): Observable<MyFilePermissionsOutput> {
  return this.http.post<MyFilePermissionsOutput>(
    `${this.rootUrl}/FileExplorer/MyPermissions`,
    {},
    { context }
  );
};

// Runtime prototype augmentations for OrganizacaoService
OrganizacaoService.prototype.minhasOrganizacoes = function (
  this: ServiceCtx,
  context?: HttpContext
): Observable<OrganizacaoResumoDto[]> {
  return this.http.get<OrganizacaoResumoDto[]>(`${this.rootUrl}/Organizacao/My`, { context });
};

OrganizacaoService.prototype.criarOrganizacao = function (
  this: ServiceCtx,
  body: CriarOrganizacaoPayloadDto,
  context?: HttpContext
): Observable<OrganizacaoDetalhesDto> {
  return this.http.post<OrganizacaoDetalhesDto>(`${this.rootUrl}/Organizacao/Create`, body, { context });
};

OrganizacaoService.prototype.atualizarOrganizacao = function (
  this: ServiceCtx,
  id: string,
  body: Partial<CriarOrganizacaoPayloadDto>,
  context?: HttpContext
): Observable<OrganizacaoDetalhesDto> {
  return this.http.post<OrganizacaoDetalhesDto>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Update`,
    body,
    { context }
  );
};

OrganizacaoService.prototype.obterDetalhes = function (
  this: ServiceCtx,
  id: string,
  context?: HttpContext
): Observable<OrganizacaoDetalhesDto> {
  return this.http.get<OrganizacaoDetalhesDto>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Details`,
    { context }
  );
};

OrganizacaoService.prototype.buscarUsuarios = function (
  this: ServiceCtx,
  search?: string,
  context?: HttpContext
): Observable<OrganizacaoUsuarioBuscaDto[]> {
  const qs = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return this.http.get<OrganizacaoUsuarioBuscaDto[]>(`${this.rootUrl}/Organizacao/Users${qs}`, { context });
};

OrganizacaoService.prototype.listarRoles = function (
  this: ServiceCtx,
  id: string,
  context?: HttpContext
): Observable<OrganizacaoRoleDto[]> {
  return this.http.get<OrganizacaoRoleDto[]>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Roles`,
    { context }
  );
};

OrganizacaoService.prototype.criarRole = function (
  this: ServiceCtx,
  id: string,
  body: { name: string; description?: string },
  context?: HttpContext
): Observable<OrganizacaoRoleDto> {
  return this.http.post<OrganizacaoRoleDto>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Roles`,
    body,
    { context }
  );
};

OrganizacaoService.prototype.removerRole = function (
  this: ServiceCtx,
  id: string,
  roleId: string,
  context?: HttpContext
): Observable<{ removed: boolean; code?: string }> {
  return this.http.post<{ removed: boolean; code?: string }>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Roles/${encodeURIComponent(roleId)}/Delete`,
    {},
    { context }
  );
};

OrganizacaoService.prototype.listarMembros = function (
  this: ServiceCtx,
  id: string,
  context?: HttpContext
): Observable<OrganizacaoMembroDto[]> {
  return this.http.get<OrganizacaoMembroDto[]>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Members`,
    { context }
  );
};

OrganizacaoService.prototype.compartilharComUsuario = function (
  this: ServiceCtx,
  id: string,
  body: CompartilharOrganizacaoPayloadDto,
  context?: HttpContext
): Observable<OrganizacaoMembroDto> {
  return this.http.post<OrganizacaoMembroDto>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Share`,
    body,
    { context }
  );
};

OrganizacaoService.prototype.atribuirRolesMembro = function (
  this: ServiceCtx,
  id: string,
  memberId: string,
  roles: string[],
  context?: HttpContext
): Observable<OrganizacaoMembroDto> {
  return this.http.post<OrganizacaoMembroDto>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Members/${encodeURIComponent(memberId)}/Roles`,
    { roles },
    { context }
  );
};

OrganizacaoService.prototype.removerMembro = function (
  this: ServiceCtx,
  id: string,
  memberId: string,
  context?: HttpContext
): Observable<{ removed: boolean }> {
  return this.http.post<{ removed: boolean }>(
    `${this.rootUrl}/Organizacao/${encodeURIComponent(id)}/Members/${encodeURIComponent(memberId)}/Remove`,
    {},
    { context }
  );
};

export const PORTAL_API_EXTENSIONS_LOADED = true;
