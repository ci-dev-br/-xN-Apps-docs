import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { join } from 'path';
import { config } from 'dotenv';
config({ path: '.env' });

async function bootstrap() {
  const httpsOptions: HttpsOptions = {
    // cert: process.env.cert ? fs.readFileSync(process.env.cert) : undefined,
    // key: process.env.key ? fs.readFileSync(process.env.key) : undefined,
    pfx: process.env.pfx ? fs.readFileSync(process.env.pfx) : undefined,
    passphrase: process.env.passphrase ? process.env.passphrase : undefined
  };
  const app =
    process.env.pfx || process.env.cert ?
      await NestFactory.create<NestExpressApplication>(AppModule, {
        httpsOptions,
      }) :
      await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:4293',
    ]
  });
  const options = new DocumentBuilder()
    .setTitle('Apps CiDevBr')
    .setDescription('Apps API')
    .setVersion('1.0.0')
    .addTag('@apps')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  const PORT = Number(process.env.PORT);
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
