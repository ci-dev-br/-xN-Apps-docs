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
import * as https from 'https';
import { LoggingInterceptor } from '@ci/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { corsOptionsDelegate } from './cors-option-delegate';

console.clear();
const is_production = !!process.execArgv.find(arg => arg === '--prod');
config({ path: is_production ? '.env' : '.env.dev' });

async function start(server: express.Express, app: NestExpressApplication, https_port: number, httpsOptions, http_port: number = 86) {
  try {


    // let ws_adapter = new WsAdapter(app);
    // app.useWebSocketAdapter(ws_adapter);

    const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());

    let wss_adapter = new WsAdapter(httpsServer);
    app.useWebSocketAdapter(wss_adapter);

    return {
      httpServer: await app.listen(http_port),
      httpsServer: httpsServer.listen(https_port),
    }
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(error);
      console.error("stop services");
      const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
      console.log(out.error)
      await start(server, app, https_port, httpsOptions);
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
  app.enableCors(corsOptionsDelegate);

  /**
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
  app.init();
  // console.log(__dirname);

  const PORT = Number(process.env.PORT);
  const servers = await start(server, app, PORT, httpsOptions);
  console.log(`Application is running on: ${await app.getUrl()} and ${PORT}`);
}
bootstrap();
