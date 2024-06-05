import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { config } from 'dotenv';
import { spawnSync } from 'child_process';
import { LoggingInterceptor } from './core/logging.interceptor';
console.clear();
const is_production = !!process.execArgv.find(arg => arg === '--prod');
config({ path: is_production ? '.env' : '.env.dev' });

async function start(app: NestExpressApplication, port: number) {
  try {
    await app.listen(port);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(error);
      const out = spawnSync('powershell', ['Stop-Service -DisplayName apps.ci.dev.br']);
      await start(app, port);
    }
  }
}

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
    origin: is_production ? [] : [
      'http://localhost:4293',
      'http://localhost:4200',
    ]
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
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
  await start(app, PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(__dirname);
}
bootstrap();
