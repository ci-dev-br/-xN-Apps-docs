import { Body, Controller, Get, Optional, Post, Req, Res } from '@nestjs/common';
import { CiApplicationService } from './app.service';
import { Public } from '../libs/auth/src/decorators/public.decorator';
import { Request, Response } from 'express';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { SitePageService } from '@ci/cms/services/site-page.service';
@Controller('*')
export class AppController {
  constructor(
    private readonly appService: CiApplicationService,
    @Optional()
    private readonly sitePage?: SitePageService,
  ) {
  }
  @Get()
  @Public()
  async root(@Req() req: Request, @Res() res: Response) {
    if (this.sitePage) {
      try {
        let host: string = this.appService.getHost(req);
        let page = await this.sitePage.getPage(host, req.path);
        if (!!page) {
          if (!!page.contentType) res.contentType(page.contentType)
          if (!!page.content) {
            res.send(page.content.join());
          }
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (!!req.path && req.path.indexOf('.') > -1) {
      try {
        if (existsSync(__dirname + `/../public${req.path}`)) {
          return res.sendFile(resolve(`public${req.path}`));
        }
        return res.sendFile(resolve('public/index.csr.html'));
      } catch (error) {
        console.error(error);
      }
    }
    return res.sendFile(resolve('public/index.csr.html'));
  }
  @Get()
  @Public()
  async ressource(@Req() req: Request, @Res() res: Response) {
    /* if (this.sitePage) {
      try {
        let host: string = this.getHost(req);
        let page = await this.sitePage.getPage(host, req.path);
        if (!!page) {
          if (!!page.contentType) res.contentType(page.contentType)
          if (!!page.content) {
            res.send(page.content.join());
          }
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (!!req.path && req.path.indexOf('.') > -1) {
      try {
        if (existsSync(__dirname + `/../public${req.path}`)) {
          return res.sendFile(resolve(`public${req.path}`));
        }
        return res.sendFile(resolve('public/index.csr.html'));
      } catch (error) {
        console.error(error);
      }
    }
    return res.sendFile(resolve('public/index.csr.html')); */
  }
}
