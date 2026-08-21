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