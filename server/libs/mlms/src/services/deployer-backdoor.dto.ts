import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// --- ENTRADAS (Requests) ---

export class GetCommitsQueryDto {
  @ApiPropertyOptional({ description: 'Quantidade de commits', default: 10, type: Number })
  limit?: number;

  @ApiPropertyOptional({ description: 'Quantos commits pular (paginação)', default: 0, type: Number })
  skip?: number;

  @ApiPropertyOptional({ description: 'Trazer histórico de todas as branches', default: true, type: Boolean })
  all?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por autor', required: false })
  author?: string;
}

export class StartAppDto {
  @ApiPropertyOptional({ description: 'Porta para iniciar o ng serve', default: 4200 })
  port?: number;
}

export class PublishActionInputDto {
  @ApiPropertyOptional({
    description: 'Ação de publicação: gulp (nova versão cliente produção), server-build (compilar backend produção), full-publish (cliente + backend) ou sync-git',
    enum: ['gulp', 'server-build', 'full-publish', 'sync-git'],
    default: 'gulp',
  })
  action?: 'gulp' | 'server-build' | 'full-publish' | 'sync-git';
}

// --- SAÍDAS (Responses) ---

export class AuthorDto {
  @ApiProperty() name: string;
  @ApiProperty() email: string;
}

export class CommitDto {
  @ApiProperty() hash: string;
  @ApiProperty() short_hash: string;
  @ApiProperty({ type: [String] }) parents: string[];
  @ApiProperty({ type: [String] }) short_parents: string[];
  @ApiProperty({ type: [String] }) branches: string[];
  @ApiProperty({ type: () => AuthorDto }) author: AuthorDto;
  @ApiProperty() date: string;
  @ApiProperty() message: string;
}

export class GetCommitsResponseDto {
  @ApiProperty() parametros: Record<string, any>;
  @ApiProperty() total_retornado: number;
  @ApiProperty({ type: [CommitDto] }) commits: CommitDto[];
}

export class ActionResponseDto {
  @ApiProperty() mensagem: string;
  @ApiPropertyOptional() saida?: string;
  @ApiPropertyOptional() status?: string;
  @ApiPropertyOptional() erro?: string;
  @ApiPropertyOptional() detalhes?: string;
}

export class AppStatusResponseDto {
  @ApiProperty({ description: 'offline | starting | online | error' }) status: string;
  @ApiPropertyOptional() porta: number | null;
  @ApiProperty({ type: [String] }) logs: string[];
}

export class VersionNodeStatusDto {
  @ApiProperty() pid: number;
  @ApiPropertyOptional() port?: number;
  @ApiProperty() status: string;
  @ApiProperty() debug: boolean;
  @ApiProperty() warmedUp: boolean;
  @ApiProperty() startedAt: string;
  @ApiPropertyOptional() lastHeartbeat?: string;
}

export class AvailableVersionInfoDto {
  @ApiProperty({ description: 'Versão atual da aplicação definida no package.json' })
  version: string;

  @ApiProperty({ description: 'Branch atual do repositório' })
  branch: string;

  @ApiProperty({ description: 'Hash completo do commit disponível' })
  commit: string;

  @ApiProperty({ description: 'Hash curto do commit disponível' })
  shortCommit: string;

  @ApiProperty({ description: 'Autor da última versão/commit' })
  author: string;

  @ApiProperty({ description: 'Data do último commit' })
  date: string;

  @ApiProperty({ description: 'Mensagem do último commit' })
  message: string;

  @ApiProperty({ description: 'Quantidade de arquivos modificados localmente pendentes de commit' })
  dirtyFilesCount: number;

  @ApiPropertyOptional({ description: 'Data/hora da última versão do cliente gerada em produção (server/public via gulp)' })
  clientPublishedAt?: string | null;

  @ApiPropertyOptional({ description: 'Data/hora do último build na pasta apps/dist/apps/browser' })
  clientDistAt?: string | null;

  @ApiPropertyOptional({ description: 'Data/hora da última compilação do backend em produção (server/dist/main.js)' })
  serverCompiledAt?: string | null;

  @ApiProperty({ description: 'PID da instância do backend que respondeu à requisição' })
  currentPid: number;

  @ApiProperty({ description: 'Modo da instância atual (debug ou production)', enum: ['debug', 'production'] })
  currentEnvironment: 'debug' | 'production';

  @ApiProperty({ description: 'Descrição do estado de orquestração automática entre Debug e Produção' })
  orchestrationMode: string;

  @ApiProperty({ type: [VersionNodeStatusDto], description: 'Instâncias ativas coordenadas pelo arquivo STATUS' })
  nodes: VersionNodeStatusDto[];

  @ApiProperty({ description: 'Status da rotina de publicação (idle | running | success | error)' })
  publishStatus: string;

  @ApiPropertyOptional({ description: 'Início da última publicação' })
  publishStartedAt?: string | null;

  @ApiPropertyOptional({ description: 'Término da última publicação' })
  publishFinishedAt?: string | null;

  @ApiProperty({ type: [String], description: 'Últimos logs da publicação' })
  publishLogs: string[];
}