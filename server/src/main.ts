import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { join } from 'path';

async function bootstrap() {
  const httpsOptions: HttpsOptions = {
    //cert: fs.readFileSync('C:/101/101.ci.dev.br-crt.pem'),
    //key: fs.readFileSync('C:/101/101.ci.dev.br-key.pem'),
    pfx: fs.readFileSync('C:\\domains\\br.com.plhx\\npm.plhx.com.br.pfx'),
    passphrase: '485916273565123@#'
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3090);
}
bootstrap();
