import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '../libs/auth/src/decorators/public.decorator';
import { Request, Response } from 'express';
import { resolve } from 'path';

@Controller('*')
export class AppController {
  constructor(private readonly appService: AppService) {
    console.log('[Hello]');
  }
  @Get()
  @Public()
  root(@Req() req: Request, @Res() res: Response) {
    return res.sendFile(resolve('public/index.html'));
  }
}
