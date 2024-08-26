import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { config } from 'dotenv';
import * as express from 'express';
import { spawnSync } from 'child_process';
import * as http from 'http';
import *as https from 'https';
import { LoggingInterceptor } from '@ci/core';

console.clear();
const is_production = !!process.execArgv.find(arg => arg === '--prod');
config({ path: is_production ? '.env' : '.env.dev' });

async function start(server: express.Express, app: NestExpressApplication, port: number, httpsOptions) {
  try {
    const httpServer = http.createServer(server).listen(86);
    const httpsServer = https.createServer(httpsOptions, server).listen(port);

    console.log(`Application is running`);
    return {
      httpServer,
      httpsServer
    }

  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(error);
      console.error("stop services");
      const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
      console.log(out.error)
      await start(server, app, port, httpsOptions);
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
  const server = express();
  const app = process.env.pfx || process.env.cert ?
    await NestFactory.create<NestExpressApplication>(AppModule,
      new ExpressAdapter(server)/* {
        httpsOptions,
      } */) :
    await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: is_production ? [] : [
      'http://apps.ci.dev.br:4200',
      'https://192.168.0.119:4200',
      'https://apps.ci.dev.br:446',
      'https://www.bing.com',
      'https://play.max.com',
      // 'http://localhost:4200',
      // 'http://localhost:4000',
      // 'http://192.168.0.119:99',
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

  app.init();
  const servers = await start(server, app, PORT, httpsOptions);
  //app.listen('84')
  //  console.log(`Application is running on: ${await app.getUrl()}`);
  // console.log(__dirname);
}
bootstrap();
