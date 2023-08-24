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
    pfx: process.env.pfx ? fs.readFileSync(process.env.pfx) : undefined,
    passphrase: process.env.passphrase ? process.env.passphrase : undefined
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions
  });
  app.enableCors({
    origin: [
      'http://localhost:4293'
    ]
  })
  const options = new DocumentBuilder()
    .setTitle('Portal Manager API')
    .setDescription('API de Integração do Portal PLHX')
    .setVersion('1.0')
    .addTag('@portal')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const PORT = Number(process.env.PORT || 3090);
  await app.listen(PORT);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
