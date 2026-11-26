import { Controller, Get, Next, OnModuleDestroy, Optional, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { resolve, extname } from 'path';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import { CiApplicationService } from './app.service';
import { SitePageService } from '@ci/cms/services/site-page.service';
import {
  DomainService,
} from '@ci/manager';
import {
  registerStaticFileCacheHandler,
  unregisterStaticFileCacheHandler,
} from '@ci/core';
import { Public } from '../libs/auth/src/decorators/public.decorator';

// @gema: https://gemini.google.com/app/3d9e20ddbe794317
@Controller()
export class AppController implements OnModuleDestroy {
  // Configurações do nosso Cache em Memória
  private readonly MAX_CACHE_FILES = 40;
  private readonly MAX_FILE_SIZE = 300 * 1024; // 300KB
  private readonly cacheHandlerId = `AppController:${Math.random().toString(36).slice(2)}`;

  // O Map preserva a ordem de inserção, funcionando como um FIFO perfeito.
  private fileCache = new Map<string, { content: Buffer; contentType: string; mtimeMs: number; size: number }>();

  constructor(
    private readonly appService: CiApplicationService,
    @Optional() private readonly sitePage?: SitePageService,
    @Optional() private readonly domain?: DomainService,
  ) {
    registerStaticFileCacheHandler(this.cacheHandlerId, {
      clearCache: () => this.clearCache(),
      getCacheStats: () => this.getCacheStats(),
    });
  }

  onModuleDestroy(): void {
    unregisterStaticFileCacheHandler(this.cacheHandlerId);
  }

  clearCache(): { clearedEntries: number } {
    const clearedEntries = this.fileCache.size;
    this.fileCache.clear();
    return { clearedEntries };
  }

  getCacheStats(): { cachedFiles: number; keys: string[] } {
    return {
      cachedFiles: this.fileCache.size,
      keys: Array.from(this.fileCache.keys()),
    };
  }

  @Get(['*'])
  @Public()
  async handleAllRequests(@Req() request: Request, @Res() response: Response, @Next() next: NextFunction) {
    const reqPath = (request.path || '').toLowerCase();
    const isApiRoute = [
      // TODO: remover daqui
      '/tenant', '/news', '/auth', '/users', '/system', '/logger', '/device',
      '/message', '/messager', '/directmessage', '/conversation', '/notification',
      '/storage', '/fiscal', '/financeiro', '/organizacao', '/produto',
      '/payment', '/cms', '/projetos', '/codex', '/notificacao', '/inpi', '/crm',
      '/dym', '/deployer', '/espazio', '/tasking', '/forms', '/api', '/indicators', '/__orchestration'
    ].some(prefix => reqPath === prefix || reqPath.startsWith(prefix + '/'));

    if (isApiRoute) {
      const acceptsHtml = request.headers.accept?.includes('text/html') &&
        !request.headers.accept?.includes('application/json');
      if (acceptsHtml) {
        const absolutePath = resolve(__dirname, '../public/index.csr.html');
        return response.sendFile(absolutePath);
      }
      return next();
    }
    try {
      if (request.url.indexOf('manifest.webmanifest') > -1) {
        const host: string = this.appService.getHost(request);
        return response.send(this.getManifestApplication(host, ''));
      }
      // 0.1 Redireciona links de convite (inclusive links antigos com ?invite= ou /registro/:invite) para a rota esperada /registrar/:invite
      const queryInvite = String(
        request.query?.invite || request.query?.inviteHash || request.query?.convite || ''
      ).trim();
      if (queryInvite && !reqPath.startsWith('/registrar/')) {
        response.setHeader('Set-Cookie', `invite=${encodeURIComponent(queryInvite)}; Path=/; SameSite=Lax`);
        return response.redirect(`/registrar/${encodeURIComponent(queryInvite)}?invite=${encodeURIComponent(queryInvite)}`);
      }
      const legacyRegistroMatch = request.path.match(/^\/registro\/([^\/?#]+)/i);
      if (legacyRegistroMatch?.[1]) {
        const legacyInvite = legacyRegistroMatch[1].trim();
        response.setHeader('Set-Cookie', `invite=${encodeURIComponent(legacyInvite)}; Path=/; SameSite=Lax`);
        return response.redirect(`/registrar/${encodeURIComponent(legacyInvite)}?invite=${encodeURIComponent(legacyInvite)}`);
      }
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
      return this.serveStaticWithCache(request, response, next);

    } catch (error) {
      console.error(error);
      if (!response.headersSent) {
        // return this.serveStaticWithCache(request, response, next);
        // old: response.status(404).send('Não existe');
      }
    }
    const absolutePath = resolve(__dirname, '../public/index.csr.html');
    return response.sendFile(absolutePath);
  }
  /**
   * Lida com arquivos do disco, cache em memória e headers do Cloudflare
   */
  private async serveStaticWithCache(request: Request, response: Response, next?: NextFunction) {
    let reqPath = request.path === '/' || !request.path.includes('.')
      ? '/index.csr.html'
      : request.path;

    let isIndex = reqPath.endsWith('index.csr.html');
    let absolutePath = resolve(__dirname, `../public${reqPath}`);
    try {
      // Verifica de forma assíncrona se o arquivo existe (não bloqueia a thread como existsSync)
      await fs.access(absolutePath, constants.R_OK);
    } catch {
      // Se for uma requisição que espera JSON e o arquivo estático não existe, repassa ao pipeline
      if (next && (request.headers.accept?.includes('application/json') || request.xhr)) {
        return next();
      }
      // Se der erro (não existe), fazemos o fallback para o index
      absolutePath = resolve(__dirname, '../public/index.csr.html');
      isIndex = true;
    }
    try {
      const stats = await fs.stat(absolutePath);

      // --- Configuração Cloudflare ---
      if (isIndex) {
        // Força a Cloudflare e o navegador a sempre revalidar o Index
        response.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else {
        // Cache na Cloudflare de 10 dias (864000 segundos) para os outros arquivos
        response.setHeader('Cache-Control', 'public, max-age=864000');
      }

      // --- Lógica de Cache em Memória ---
      const cachedFile = this.fileCache.get(absolutePath);

      if (cachedFile) {
        if (cachedFile.mtimeMs !== stats.mtimeMs || cachedFile.size !== stats.size) {
          // Arquivo atualizado no disco! Invalidamos o cache em memória.
          this.fileCache.delete(absolutePath);
        } else {
          // Retorna direto da memória
          response.contentType(cachedFile.contentType);
          return response.send(cachedFile.content);
        }
      }

      // --- Carregando o arquivo para Memória ou via Stream ---
      if (stats.size <= this.MAX_FILE_SIZE) {
        // Menor que MAX_FILE_SIZE: Lê do disco, guarda em memória e envia
        const content = await fs.readFile(absolutePath);
        const contentType = this.getContentType(absolutePath);

        // Se batermos MAX_CACHE_FILES arquivos, removemos o mais antigo (primeira chave do Map)
        if (this.fileCache.size >= this.MAX_CACHE_FILES) {
          const oldestKey = this.fileCache.keys().next().value;
          this.fileCache.delete(oldestKey);
        }

        // Salva no cache com a data de modificação e tamanho
        this.fileCache.set(absolutePath, {
          content,
          contentType,
          mtimeMs: stats.mtimeMs,
          size: stats.size,
        });

        response.contentType(contentType);
        return response.send(content);
      } else {
        // Maior que MAX_FILE_SIZE: Deixa o Express fazer o stream direto do disco
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
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.webmanifest': 'application/manifest+json',
      '.map': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.wasm': 'application/wasm',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private getManifestApplication(host: string, application: string = "Apps") {
    return {
      "name": "Aplicativos",
      "short_name": application,
      "start_url": `https://${host}/`,
      "display": "standalone",
      "background_color": "#99DDAA",
      "description": "Apps.",
      "icons": [
        {
          "src": "apps.png",
          "sizes": "48x48",
          "type": "image/png"
        }
      ]
    }
  }
}