/* tslint:disable */
/* eslint-disable */
import { VersionNodeStatusDto } from '../models/version-node-status-dto';
export interface AvailableVersionInfoDto {

  /**
   * Autor da última versão/commit
   */
  author: string;

  /**
   * Branch atual do repositório
   */
  branch: string;

  /**
   * Data/hora do último build na pasta apps/dist/apps/browser
   */
  clientDistAt?: string | null;

  /**
   * Data/hora da última versão do cliente gerada em produção (server/public via gulp)
   */
  clientPublishedAt?: string | null;

  /**
   * Hash completo do commit disponível
   */
  commit: string;

  /**
   * Modo da instância atual (debug ou production)
   */
  currentEnvironment: 'debug' | 'production';

  /**
   * PID da instância do backend que respondeu à requisição
   */
  currentPid: number;

  /**
   * Data do último commit
   */
  date: string;

  /**
   * Quantidade de arquivos modificados localmente pendentes de commit
   */
  dirtyFilesCount: number;

  /**
   * Mensagem do último commit
   */
  message: string;

  /**
   * Instâncias ativas coordenadas pelo arquivo STATUS
   */
  nodes: Array<VersionNodeStatusDto>;

  /**
   * Descrição do estado de orquestração automática entre Debug e Produção
   */
  orchestrationMode: string;

  /**
   * Término da última publicação
   */
  publishFinishedAt?: string | null;

  /**
   * Últimos logs da publicação
   */
  publishLogs: Array<string>;

  /**
   * Início da última publicação
   */
  publishStartedAt?: string | null;

  /**
   * Status da rotina de publicação (idle | running | success | error)
   */
  publishStatus: string;

  /**
   * Data/hora da última compilação do backend em produção (server/dist/main.js)
   */
  serverCompiledAt?: string | null;

  /**
   * Hash curto do commit disponível
   */
  shortCommit: string;

  /**
   * Versão atual da aplicação definida no package.json
   */
  version: string;
}
