import * as http from 'http';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { 
  GetCommitsQueryDto, 
  StartAppDto, 
  GetCommitsResponseDto, 
  ActionResponseDto, 
  AppStatusResponseDto 
} from './deployer-backdoor.dto';

@Injectable()
export class DeployerBackdoorServices {
  // Idealmente, busque essa URL de variáveis de ambiente (ex: ConfigService)
  private readonly backdoorUrl = 'http://localhost:4666';

  /**
   * Método utilitário privado para encapsular o http nativo do Node.js em Promises
   */
  private makeRequest<T>(method: string, path: string, body?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.backdoorUrl}${path}`);
      
      const options: http.RequestOptions = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          'Accept': 'application/json',
        },
      };

      if (body) {
        options.headers['Content-Type'] = 'application/json';
      }

      const req = http.request(options, (res) => {
        let rawData = '';

        // Recebe os dados em pedaços (chunks)
        res.on('data', (chunk) => {
          rawData += chunk;
        });

        // Quando a resposta terminar de ser recebida
        res.on('end', () => {
          try {
            const parsedData = rawData ? JSON.parse(rawData) : null;
            
            // Verifica se o status HTTP indica sucesso (2xx)
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData as T);
            } else {
              reject(new InternalServerErrorException(parsedData || 'Erro na requisição ao servidor backend'));
            }
          } catch (e) {
            reject(new InternalServerErrorException('Falha ao processar a resposta do servidor'));
          }
        });
      });

      // Lida com erros de rede (ex: servidor offline)
      req.on('error', (err) => {
        reject(new InternalServerErrorException(`Erro de conexão com o script Node: ${err.message}`));
      });

      // Se houver um corpo na requisição (POST), escreve ele no stream
      if (body) {
        req.write(JSON.stringify(body));
      }

      // Finaliza o envio da requisição
      req.end();
    });
  }

  async getCommits(query: GetCommitsQueryDto): Promise<GetCommitsResponseDto> {
    // Converte o objeto de DTO em query string (ex: limit=10&skip=0)
    // Usamos Record<string, string> para garantir que URLSearchParams aceite os valores
    const cleanQuery = Object.entries(query)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});
      
    const qs = new URLSearchParams(cleanQuery).toString();
    const path = qs ? `/commits?${qs}` : '/commits';

    return this.makeRequest<GetCommitsResponseDto>('GET', path);
  }

  async executeCommit(): Promise<ActionResponseDto> {
    return this.makeRequest<ActionResponseDto>('POST', '/commit');
  }

  async startApp(dto: StartAppDto): Promise<ActionResponseDto> {
    return this.makeRequest<ActionResponseDto>('POST', '/app/start', dto);
  }

  async stopApp(): Promise<ActionResponseDto> {
    return this.makeRequest<ActionResponseDto>('POST', '/app/stop');
  }

  async getAppStatus(): Promise<AppStatusResponseDto> {
    return this.makeRequest<AppStatusResponseDto>('GET', '/app/status');
  }
}