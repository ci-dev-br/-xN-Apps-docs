/* tslint:disable */
/* eslint-disable */
export interface GrupoAtivoCompartilhado {

  /**
   * ID original do ativo compartilhado
   */
  ativoId: string;

  /**
   * ID do usuário que realizou o compartilhamento
   */
  compartilhadoPorId: string;
  compartilhadoPorNome: string | null;
  compartilhadoPorPhoto: string | null;
  createdAt: string | null;

  /**
   * Descrição ou resumo do ativo
   */
  descricao: string | null;

  /**
   * ID do grupo
   */
  grupoId: string;
  id: string;

  /**
   * Metadados adicionais em JSON (ex: dados do formulário ou notícia)
   */
  metadados: {
} | null;

  /**
   * ID do tenant do grupo que concede visibilidade aos membros
   */
  tenantId: string;
  tipoAtivo: 'NOTICIA' | 'FORMULARIO' | 'CADASTRO' | 'DOCUMENTO' | 'OUTRO';

  /**
   * Título do ativo compartilhado
   */
  titulo: string;
  updatedAt: string | null;

  /**
   * URL ou rota de acesso ao ativo
   */
  url: string | null;
}
