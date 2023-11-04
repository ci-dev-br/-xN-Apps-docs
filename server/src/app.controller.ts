import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { Request, Response } from 'express';
import { resolve } from 'path';

@Controller('*')
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Get()
  @Public()
  root(@Req() req: Request, @Res() res: Response) {
    return res.sendFile(resolve('public/index.html'));
  }
}
