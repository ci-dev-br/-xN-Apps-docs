import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '../libs/auth/src/decorators/public.decorator';
import { Request, Response } from 'express';
import { resolve } from 'path';
import { existsSync } from 'fs';

@Controller('*')
export class AppController {
  constructor(private readonly appService: AppService) {
  }
  @Get()
  @Public()
  root(@Req() req: Request, @Res() res: Response) {
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
}
