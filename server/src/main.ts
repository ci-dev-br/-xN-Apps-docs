import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'node:fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { config } from 'dotenv';
import * as express from 'express';
import { spawnSync } from 'child_process';
import * as https from 'https';
import { LoggingInterceptor } from '@ci/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { corsOptionsDelegate } from './cors-option-delegate';
console.clear();
const is_production = !!process.execArgv.find(arg => arg === '--prod');
config(/* { path: is_production ? '.env' : '.env.dev' } */);
async function start(server: express.Express, app: NestExpressApplication, https_port: number, httpsOptions, http_port: number = 86, internalHttpsOptions, https_internal_port: number = 664) {
  try {
    const applicationInstance = app.getHttpAdapter().getInstance();
    if (app)
      app.listen(http_port, () => {
        console.log(`Non-Sercure HTTP Application is Running on ${http_port}`);
      });
    const httpsServer = https.createServer(httpsOptions, applicationInstance);
    if (httpsServer) {
      httpsServer.listen(https_port, () => {
        console.log(`Secure Internet Application is Running on ${https_port}`);
      });
      let wss_adapter = new WsAdapter(httpsServer);
      app.useWebSocketAdapter(wss_adapter);
    }
    const httpsInternalServer = !!internalHttpsOptions ? https.createServer(internalHttpsOptions, applicationInstance) : undefined;
    if (httpsInternalServer) {
      httpsInternalServer.listen(https_internal_port, () => {
        console.log(`Secure Intranet Application is Running on ${https_internal_port}`);
      });
      let wss_internal_adapter = new WsAdapter(httpsInternalServer);
      app.useWebSocketAdapter(wss_internal_adapter);
    }
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(error);
      console.error("stop services");
      const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
      console.log(out.error)
      await start(server, app, https_port, httpsOptions, http_port || 86, internalHttpsOptions, https_internal_port);
    } else {
      console.error('Falha ao iniciar serviços...');
      console.trace(error);
    }
  }
}
async function bootstrap() {
  const httpsOptions: HttpsOptions = {
    cert: process.env.cert ? fs.readFileSync(process.env.cert) : undefined,
    key: process.env.key ? fs.readFileSync(process.env.key) : undefined,
    pfx: process.env.pfx ? fs.readFileSync(process.env.pfx) : undefined,
    passphrase: process.env.passphrase ? process.env.passphrase : undefined
  };
  const internalHttpsOptions: HttpsOptions = (!!process.env.internal_pfx || !!process.env.internal_key) ? {
    cert: !!process.env.internal_cert ? fs.readFileSync(process.env.internal_cert) : undefined,
    key: !!process.env.internal_key ? fs.readFileSync(process.env.internal_key) : undefined,
    pfx: !!process.env.internal_pfx ? fs.readFileSync(process.env.internal_pfx) : undefined,
    passphrase: !!process.env.internal_passphrase ? process.env.internal_passphrase : undefined
    // pfx: process.env.internal_pfx ? fs.readFileSync(process.env.internal_pfx) : undefined,
    // passphrase: process.env.internal_passphrase ? process.env.internal_passphrase : undefined,
    // key: process.env.internal_key ? fs.readFileSync(process.env.internal_key) : undefined,
    // cert: process.env.internal_cert ? fs.readFileSync(process.env.internal_cert) : undefined
  } : undefined;
  const server = express();
  const app = process.env.pfx || process.env.cert ?
    await NestFactory.create<NestExpressApplication>(AppModule,
      new ExpressAdapter(server)) :
    await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(corsOptionsDelegate);
  /**
   * Configuração do Open API v3 para integração externa
   * Swagger Open API 3
   */
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
  /** HBS View Engine */
  app.setViewEngine('hbs');
  /**
   * Websocket (ws)
   */
  app.useGlobalInterceptors(new LoggingInterceptor());
  start(server, app, Number(process.env.PORT), httpsOptions, 86, internalHttpsOptions, Number(process.env.INTERNAL_PORT));
  let service_application = await app.init();

}
try {
  bootstrap();
} catch (error) {
  error.trace('[end]', error);
}
