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
import { PranchetaEntities, PranchetaModule } from './prancheta/prancheta.module';
import { IconEntities, IconsModule } from './icons/icons.module';
import { MoreThanOrEqual } from 'typeorm';

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
      logging: true,
      appname: '@CiDevBr/Portal',
      autoSave: true,
      cache: true,
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
        ...PranchetaEntities,
        ...IconEntities,
      ]
    }),
    NotificacaoModule,
    AuthModule,
    ManagerModule,
    MessagerModule,
    ProdutoModule,
    CodexModule,
    GlobalizationModule,
    PranchetaModule,
    IconsModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
