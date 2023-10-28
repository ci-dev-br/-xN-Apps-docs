import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Entities as NotificacaoEntities, NotificacaoModule } from './notificacao/notificacao.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, Entities as AuthEntities } from './auth/auth.module';
import { config } from 'dotenv';
import { ManagerEntities, ManagerModule } from './manager/manager.module';
import { MessagerModule, Entities as MessageEntities } from './messager/messager.module';
import { ProdutoModule, Entities as ProdutoEntities } from './produto/produto.module';
import { CodexModule, CodeXEntities } from './codex/codex.module';
import { GlobalizationEntities, GlobalizationModule } from './globalization/globalization.module';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 0),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: Boolean(process.env.DB_SYNCHRONIZE || false),
      logger: 'debug',
      loggerLevel: 'debug',
      appname: '@CiDevBr/Portal',
      maxQueryExecutionTime: 100,
      verboseRetryLog: true,
      entities: [
        ...NotificacaoEntities,
        ...AuthEntities,
        ...ManagerEntities,
        ...MessageEntities,
        ...ProdutoEntities,
        ...CodeXEntities,
        ...GlobalizationEntities,
      ]
    }),
    NotificacaoModule,
    AuthModule,
    ManagerModule,
    MessagerModule,
    ProdutoModule,
    CodexModule,
    GlobalizationModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
