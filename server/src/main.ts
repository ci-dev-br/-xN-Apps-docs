import { Logger, LoggingInterceptor } from '@ci/core';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { config } from 'dotenv';
import * as express from 'express';
import { spawnSync } from 'child_process';
import { WsAdapter } from '@nestjs/platform-ws';
import { corsOptionsDelegate } from './cors-option-delegate';
/***  
 * 
 * Inicializa variáveis de ambiente
 * 
***/
config();
// Inicialização do Logger customizado (assumindo que seja um setup global/side-effect)
new Logger(console);
/**
 * Tenta iniciar a aplicação na porta especificada.
 * Caso a porta esteja em uso (EADDRINUSE), tenta parar o serviço Windows associado
 * e reiniciar a aplicação recursivamente.
 *
 * @param app - A instância da aplicação NestJS.
 * @param port - A porta onde a aplicação deve escutar.
 */
async function startApplication(app: NestExpressApplication, port: number) {
  try {
    // Configura o adapter de WebSocket
    app.useWebSocketAdapter(new WsAdapter(app));
    // Inicia o listener HTTP
    await app.listen(port, () => {
      console.log(`Non-Secure HTTP Application is Running on port ${port}`);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.trace(error);
      console.warn('Port in use. Attempting to stop colliding services...');
      // NOTA: Este comando é específico para ambientes Windows PowerShell
      const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
      if (out.error) {
        console.error('Failed to stop service:', out.error);
      } else {
        console.log('Service stopped successfully. Retrying...');
      }
      // Tentativa recursiva de iniciar a aplicação
      await startApplication(app, port);
    } else {
      console.trace('[Falha ao iniciar serviços]');
      console.trace(error);
      process.exit(1);
    }
  }
}
/**
 * Função principal de inicialização (Bootstrap) da aplicação NestJS.
 * Configura Express, Swagger, Assets estáticos, View Engine e Interceptadores.
 */
async function bootstrap() {
  const server = express();
  // Define porta padrão como 86 se não especificada no .env
  const httpPort = Number(process.env.PORT) || 86;
  // Criação da aplicação NestJS com Express Adapter
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  // Configuração de CORS
  app.enableCors(corsOptionsDelegate);
  /**
   * Configuração do Open API v3 (Swagger)
   */
  const options = new DocumentBuilder()
    .setTitle('Apps CiDevBr')
    .setDescription('Apps API')
    .setVersion('1.0.1')
    .addTag('@apps')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  // Configurações de MVC (Assets e Views)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  /**
   * Configuração Global de Interceptadores
   */
  app.useGlobalInterceptors(new LoggingInterceptor());
  // Inicia o ciclo de start da aplicação
  await startApplication(app, httpPort);
}
// Execução segura do bootstrap
try {
  bootstrap().catch((err) => {
    console.error('[Bootstrap Error]', err);
  });
} catch (error) {
  console.error('[Fatal Error]', error);
}