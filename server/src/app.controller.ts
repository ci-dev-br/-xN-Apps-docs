import { Body, Controller, Get, Optional, Post, Req, Res } from '@nestjs/common';
import { CiApplicationService } from './app.service';
import { Public } from '../libs/auth/src/decorators/public.decorator';
import { Request, Response } from 'express';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { SitePageService } from '@ci/cms/services/site-page.service';
import { DomainService } from '@ci/manager';
@Controller()
export class AppController {
  constructor(
    private readonly appService: CiApplicationService,
    @Optional()
    private readonly sitePage?: SitePageService,
    @Optional() private readonly domain?: DomainService,
  ) {
  }
  @Get()
  @Public()
  async root(
    @Req() request: Request,
    @Res() response: Response) {
    const hostname = request.hostname;
    const origin = request.headers.origin;
    if (this.sitePage) {
      try {
        let host: string = this.appService.getHost(request);
        let page = await this.sitePage.getPage(host, request.path);
        if (!!page) {
          if (!!page.contentType) response.contentType(page.contentType)
          if (!!page.content) {
            response.send(page.content.join());
          }
          return;
        } else {
          // ;3 não sei..., será que é isso mesmo?
        }
      } catch (error) {
        console.trace(error);
      }
    }
    if (!!request.path && request.path.indexOf('.') > -1) {
      try {
        if (existsSync(__dirname + `/../public${request.path}`)) {
          return response.sendFile(resolve(`public${request.path}`));
        }
        return response.sendFile(resolve('public/index.csr.html'));
      } catch (error) {
        console.trace(error);
      }
    }
    return response.sendFile(resolve('public/index.csr.html'));
  }
  @Get('/*\w')
  @Public()
  async GetResource(
    @Req() request: Request,
    @Res() response: Response
  ) {
    console.trace('Acesso');
    if (this.sitePage) {
      try {
        let host: string = this.appService.getHost(request);
        let page = await this.sitePage.getPage(host, request.path);
        if (!!page) {
          if (!!page.contentType) response.contentType(page.contentType)
          if (!!page.content) {
            response.send(page.content.join());
          }
          return;
        }
      } catch (error) {
        console.trace(error);
      }
    }
    if (!!request.path && request.path.indexOf('.') > -1) {
      try {
        if (existsSync(__dirname + `/../public${request.path}`)) {
          return response.sendFile(resolve(`public${request.path}`));
        }
        return response.sendFile(resolve('public/index.csr.html'));
      } catch (error) {
        console.trace(error);
      }
    }
    return response.sendFile(resolve('public/index.csr.html'));
  }
}
