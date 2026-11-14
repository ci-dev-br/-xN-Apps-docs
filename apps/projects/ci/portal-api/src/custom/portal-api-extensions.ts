import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StrictHttpResponse } from '../lib/strict-http-response';
import { User } from '../lib/models/user';
import { News } from '../lib/models/news';
import { AuthService } from '../lib/services/auth.service';
import { NewsService } from '../lib/services/news.service';
import { CarteiraService } from '../lib/services/carteira.service';
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

export interface VisaoGeralCarteiraDto {
  possuiCarteira?: boolean;
  carteira?: CarteiraDto | null;
  carteiras?: CarteiraDto[];
  patrimonioTotalBrl?: number;
  transacoesRecentes: TransacaoCarteiraDto[];
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
    getMarketNews(params?: { search?: string; category?: string; limit?: number; offset?: number } | GetMarketNews$Params, context?: HttpContext): Observable<Array<News>>;
    vote(newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<NewsVoteStats>;
    getVoteStats(newsId: string, context?: HttpContext): Observable<NewsVoteStats>;
    comment(newsId: string, content: string, context?: HttpContext): Observable<NewsCommentItem>;
    getComments(newsId: string, context?: HttpContext): Observable<Array<NewsCommentItem>>;
    followUser(userId: string, context?: HttpContext): Observable<any>;
    unfollowUser(userId: string, context?: HttpContext): Observable<{ success: boolean }>;
    getSocialStatus(userId: string, context?: HttpContext): Observable<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }>;
  }
}

declare module '../lib/services/carteira.service' {
  export interface CarteiraService {
    obterMinhaCarteira(autoCreate?: boolean, carteiraId?: string): Observable<VisaoGeralCarteiraDto>;
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
NewsService.prototype.getMarketNews = function (
  this: ServiceCtx,
  params?: { search?: string; category?: string; limit?: number; offset?: number },
  context?: HttpContext
): Observable<Array<News>> {
  const queryParams: string[] = [];
  if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.category) queryParams.push(`category=${encodeURIComponent(params.category)}`);
  if (params?.limit !== undefined) queryParams.push(`limit=${params.limit}`);
  if (params?.offset !== undefined) queryParams.push(`offset=${params.offset}`);
  const qs = queryParams.length ? `?${queryParams.join('&')}` : '';
  return this.http.get<Array<News>>(`${this.rootUrl}/News/Market${qs}`, { context });
};

NewsService.prototype.vote = function (this: ServiceCtx, newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<NewsVoteStats> {
  return this.http.post<NewsVoteStats>(`${this.rootUrl}/News/Vote`, { newsId, vote }, { context });
};

NewsService.prototype.getVoteStats = function (this: ServiceCtx, newsId: string, context?: HttpContext): Observable<NewsVoteStats> {
  return this.http.get<NewsVoteStats>(`${this.rootUrl}/News/VoteStats/${newsId}`, { context });
};

NewsService.prototype.comment = function (this: ServiceCtx, newsId: string, content: string, context?: HttpContext): Observable<NewsCommentItem> {
  return this.http.post<NewsCommentItem>(`${this.rootUrl}/News/Comment`, { newsId, content }, { context });
};

NewsService.prototype.getComments = function (this: ServiceCtx, newsId: string, context?: HttpContext): Observable<Array<NewsCommentItem>> {
  return this.http.get<Array<NewsCommentItem>>(`${this.rootUrl}/News/Comments/${newsId}`, { context });
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
CarteiraService.prototype.obterMinhaCarteira = function (this: ServiceCtx, autoCreate?: boolean, carteiraId?: string): Observable<VisaoGeralCarteiraDto> {
  const params: string[] = [];
  if (autoCreate) params.push('autoCreate=true');
  if (carteiraId) params.push(`carteiraId=${encodeURIComponent(carteiraId)}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  return this.http.get<VisaoGeralCarteiraDto>(`${this.rootUrl}/Financeiro/Carteira/Minha${qs}`);
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

export const PORTAL_API_EXTENSIONS_LOADED = true;
