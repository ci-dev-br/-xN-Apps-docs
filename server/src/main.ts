import { Logger, LoggingInterceptor } from '@ci/core';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { config } from 'dotenv';
import * as express from 'express';
import { spawn, spawnSync } from 'child_process';
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
  } catch (error: any) {
    try {
      if (error.code === 'EADDRINUSE') {
        console.trace(error);
        console.warn('Port in use. Attempting to stop colliding services...');
        // NOTA: Este comando é específico para ambientes Windows PowerShell
        const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
        if (out.error) {
          console.trace('Failed to stop service:', out.error);
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
    } catch (error) {
      console.trace(error);
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

  /**
   * Inicia a aplicação em modo desenvolvimento para manutenção 
   * (experimental):
   *  - A implementação oficial deve ativar/desativar mediante
   * chamada via API por Usuário autorizado via Politica de Acesso
   */
  async function RunDevClient() {
    try {
      // Define o caminho absoluto para a pasta ./client
      const clientPath = join(__dirname, '..', '..', 'apps');

      console.log(`\x1b[36m[Runner]\x1b[0m Iniciando o Angular CLI em: ${clientPath}...`);

      // No Windows, o comando 'ng' precisa ser executado como 'ng.cmd'
      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'cmd' : 'ng';

      // Dispara o processo child_process.spawn
      const ngServe = spawn(command, ['npm', 'run', 'watch'], {
        cwd: clientPath, // Define o diretório de trabalho corrente
        shell: true,     // Garante compatibilidade com o ambiente de execução
        stdio: 'inherit' // Redireciona stdin, stdout e stderr diretamente para o terminal pai
      });

      // Trata o encerramento do processo do Angular
      ngServe.on('close', (code) => {
        if (code === 0) {
          console.log('\x1b[32m[Runner]\x1b[0m Processo do Angular finalizado com sucesso.');
        } else {
          console.error(`\x1b[31m[Runner]\x1b[0m O processo do Angular falhou e fechou com o código ${code}`);
        }
      });

      // Trata erros ao tentar disparar o processo (ex: se o 'ng' não estiver instalado)
      ngServe.on('error', (err) => {
        console.error('\x1b[31m[Runner]\x1b[0m Erro ao tentar rodar o comando ng:', err.message);
      });
    } catch (err) {
      console.trace('Falha ao executar ambiente de desenvolvimento');
      console.trace(err);
    }
  }
  RunDevClient()
}
// Execução segura do bootstrap
try {
  bootstrap().catch((err) => {
    console.trace('[Bootstrap Error]', err);
  });
} catch (error) {
  console.trace('[Fatal Error]', error);
}
