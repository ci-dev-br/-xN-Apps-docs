import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';

export interface GroupItem {
  id: string;
  name: string;
  descriptions?: string;
  createdBy?: string;
  adminId?: string;
  avatarUrl?: string;
  coverUrl?: string;
  requiresApproval?: boolean;
  tenantId?: string;
  tenant?: any;
  createdAt?: string;
  membersCount: number;
  pendingCount?: number;
  userStatus: 'ADMIN' | 'MEMBER' | 'PENDING' | 'NONE';
  admin?: {
    id: string;
    username: string;
    surname?: string;
    fullName?: string;
    photo?: any;
  } | null;
}

export interface GroupMemberRequestItem {
  id: string;
  tenantId: string;
  userId: string;
  requestedAt: string;
  user?: {
    id: string;
    username: string;
    surname?: string;
    fullName?: string;
    photo?: any;
  } | null;
}

export interface CriarGrupoPayload {
  name: string;
  descriptions?: string;
  coverUrl?: string;
  avatarUrl?: string;
  requiresApproval?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /**
   * Lista grupos públicos disponíveis, com filtro opcional por termo.
   */
  listarGrupos(termo?: string): Observable<GroupItem[]> {
    const query = termo ? `?termo=${encodeURIComponent(termo)}` : '';
    return this.http.get<GroupItem[]>(`${this.rootUrl}/Tenant/Groups${query}`);
  }

  /**
   * Retorna os grupos dos quais o usuário participa ou gerencia.
   */
  meusGrupos(): Observable<GroupItem[]> {
    return this.http.get<GroupItem[]>(`${this.rootUrl}/Tenant/Groups/My`);
  }

  /**
   * Obtém detalhes de um grupo por ID.
   */
  obterGrupo(id: string): Observable<GroupItem> {
    return this.http.get<GroupItem>(`${this.rootUrl}/Tenant/Groups/${id}`);
  }

  /**
   * Cria um novo grupo. O criador se torna o Administrador e membro do Tenant.
   */
  criarGrupo(payload: CriarGrupoPayload): Observable<GroupItem> {
    return this.http.post<GroupItem>(`${this.rootUrl}/Tenant/Groups`, payload);
  }

  /**
   * Solicita participação em um grupo.
   */
  solicitarParticipacao(id: string): Observable<{ status: 'APPROVED' | 'PENDING'; message: string }> {
    return this.http.post<{ status: 'APPROVED' | 'PENDING'; message: string }>(
      `${this.rootUrl}/Tenant/Groups/${id}/Join`,
      {}
    );
  }

  /**
   * Sai do grupo ou cancela a solicitação.
   */
  sairDoGrupo(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.rootUrl}/Tenant/Groups/${id}/Leave`,
      {}
    );
  }

  /**
   * Lista solicitações pendentes de participação (apenas para o administrador do grupo).
   */
  listarSolicitacoes(tenantId: string): Observable<GroupMemberRequestItem[]> {
    return this.http.get<GroupMemberRequestItem[]>(
      `${this.rootUrl}/Tenant/Groups/${tenantId}/Requests`
    );
  }

  /**
   * Aprova ou rejeita uma solicitação pendente de participação.
   */
  responderSolicitacao(tenantId: string, requestId: string, aprovar: boolean): Observable<{ message: string; status: string }> {
    return this.http.post<{ message: string; status: string }>(
      `${this.rootUrl}/Tenant/Groups/${tenantId}/Requests/${requestId}/Respond`,
      { aprovar }
    );
  }

  /**
   * Lista tópicos de discussão do grupo.
   */
  listarTopicos(grupoId: string): Observable<GroupTopicItem[]> {
    return this.http.get<GroupTopicItem[]>(`${this.rootUrl}/Tenant/Groups/${grupoId}/Topics`);
  }

  /**
   * Cria um novo tópico de discussão no grupo.
   */
  criarTopico(grupoId: string, dados: { title: string; content: string }): Observable<GroupTopicItem> {
    return this.http.post<GroupTopicItem>(`${this.rootUrl}/Tenant/Groups/${grupoId}/Topics`, dados);
  }

  /**
   * Lista mensagens de um tópico.
   */
  listarMensagensTopico(topicId: string): Observable<GroupTopicMessageItem[]> {
    return this.http.get<GroupTopicMessageItem[]>(`${this.rootUrl}/Tenant/Groups/0/Topics/${topicId}/Messages`);
  }

  /**
   * Envia uma resposta em um tópico de conversa.
   */
  responderTopico(topicId: string, content: string): Observable<GroupTopicMessageItem> {
    return this.http.post<GroupTopicMessageItem>(`${this.rootUrl}/Tenant/Groups/0/Topics/${topicId}/Messages`, { content });
  }

  /**
   * Lista os ativos (Notícias, Formulários, Cadastros) compartilhados com o grupo via Tenant.
   */
  listarAtivosCompartilhados(grupoId: string): Observable<GroupSharedAssetItem[]> {
    return this.http.get<GroupSharedAssetItem[]>(`${this.rootUrl}/Tenant/Groups/${grupoId}/SharedAssets`);
  }

  /**
   * Compartilha um ativo com o Grupo associando o tenantId do grupo.
   */
  compartilharAtivo(grupoId: string, dados: {
    tipoAtivo: 'NOTICIA' | 'FORMULARIO' | 'CADASTRO' | 'DOCUMENTO' | 'OUTRO';
    ativoId: string;
    titulo: string;
    descricao?: string;
    url?: string;
    metadados?: any;
  }): Observable<GroupSharedAssetItem> {
    return this.http.post<GroupSharedAssetItem>(`${this.rootUrl}/Tenant/Groups/${grupoId}/SharedAssets`, dados);
  }
}

export interface GroupTopicItem {
  id: string;
  grupoId: string;
  tenantId: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  repliesCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupTopicMessageItem {
  id: string;
  topicoId: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
}

export interface GroupSharedAssetItem {
  id: string;
  grupoId: string;
  tenantId: string;
  tipoAtivo: 'NOTICIA' | 'FORMULARIO' | 'CADASTRO' | 'DOCUMENTO' | 'OUTRO';
  ativoId: string;
  titulo: string;
  descricao?: string;
  url?: string;
  metadados?: any;
  compartilhadoPorId: string;
  compartilhadoPorNome?: string;
  compartilhadoPorPhoto?: string;
  createdAt: string;
}
