import { Controller, Get, Optional, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { resolve, extname } from 'path';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import { CiApplicationService } from './app.service';
import { SitePageService } from '@ci/cms/services/site-page.service';
import { DomainService } from '@ci/manager';
import { Public } from '../libs/auth/src/decorators/public.decorator';

// @gema: https://gemini.google.com/app/3d9e20ddbe794317
@Controller()
export class AppController {
  // Configurações do nosso Cache em Memória
  private readonly MAX_CACHE_FILES = 100;
  private readonly MAX_FILE_SIZE = 300 * 1024; // 200KB

  // O Map preserva a ordem de inserção, funcionando como um FIFO perfeito.
  private fileCache = new Map<string, { content: Buffer; contentType: string; mtimeMs: number }>();

  constructor(
    private readonly appService: CiApplicationService,
    @Optional() private readonly sitePage?: SitePageService,
    @Optional() private readonly domain?: DomainService,
  ) { }

  @Get(['/', '/*\w'])
  @Public()
  async handleAllRequests(@Req() request: Request, @Res() response: Response) {
    // Nota: Removi o setTimeout para evitar crash de headers enviados em requisições lentas.
    console.log(request.url)
    try {
      // 1. Tenta servir dinamicamente via CMS (SitePageService)
      if (this.sitePage) {
        const host: string = this.appService.getHost(request);
        const page = await this.sitePage.getPage(host, request.path);

        if (page && page.content) {
          if (page.contentType) response.contentType(page.contentType);
          return response.send(page.content.join());
        }
      }

      // 2. Se não achou no CMS, serve arquivos estáticos com cache
      return this.serveStaticWithCache(request, response);

    } catch (error) {
      console.error(error);
      if (!response.headersSent) {
        return response.status(500).send('Erro interno');
      }
    }
  }

  /**
   * Lida com arquivos do disco, cache em memória e headers do Cloudflare
   */
  private async serveStaticWithCache(request: Request, response: Response) {
    let reqPath = request.path === '/' || !request.path.includes('.')
      ? '/index.csr.html'
      : request.path;

    let isIndex = reqPath.endsWith('index.csr.html');
    let absolutePath = resolve(__dirname, `../public${reqPath}`);

    try {
      // Verifica de forma assíncrona se o arquivo existe (não bloqueia a thread como existsSync)
      await fs.access(absolutePath, constants.R_OK);
    } catch {
      // Se der erro (não existe), fazemos o fallback para o index
      absolutePath = resolve('public/index.csr.html');
      isIndex = true;
    }

    try {
      const stats = await fs.stat(absolutePath);

      // --- Configuração Cloudflare ---
      if (isIndex) {
        // Força a Cloudflare e o navegador a sempre revalidar o Index
        response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      } else {
        // Cache na Cloudflare de 10 dias (864000 segundos) para os outros arquivos
        response.setHeader('Cache-Control', 'public, max-age=864000');
      }

      // --- Lógica de Cache em Memória ---
      const cachedFile = this.fileCache.get(absolutePath);

      if (cachedFile) {
        if (isIndex && cachedFile.mtimeMs !== stats.mtimeMs) {
          // O arquivo Index foi atualizado no disco! Invalidamos o cache.
          this.fileCache.delete(absolutePath);
        } else {
          // Retorna direto da memória
          response.contentType(cachedFile.contentType);
          return response.send(cachedFile.content);
        }
      }

      // --- Carregando o arquivo para Memória ou via Stream ---
      if (stats.size <= this.MAX_FILE_SIZE) {
        // Menor que 200kb: Lê do disco, guarda em memória e envia
        const content = await fs.readFile(absolutePath);
        const contentType = this.getContentType(absolutePath);

        // Se batermos 40 arquivos, removemos o mais antigo (primeira chave do Map)
        if (this.fileCache.size >= this.MAX_CACHE_FILES) {
          const oldestKey = this.fileCache.keys().next().value;
          this.fileCache.delete(oldestKey);
        }

        // Salva no cache com a data de modificação
        this.fileCache.set(absolutePath, { content, contentType, mtimeMs: stats.mtimeMs });

        response.contentType(contentType);
        return response.send(content);
      } else {
        // Maior que 200kb: Deixa o Express fazer o stream direto do disco
        return response.sendFile(absolutePath);
      }

    } catch (error) {
      console.error('[Erro de I/O]', error);
      if (!response.headersSent) {
        response.status(404).send('Not Found');
      }
    }
  }

  /**
   * Helper para descobrir o mime-type correto baseado na extensão
   */
  private getContentType(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}