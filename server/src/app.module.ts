import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Entities as NotificacaoEntities, NotificacaoModule } from './notificacao/notificacao.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthEntities as AuthEntities } from './auth/auth.module';
import { config } from 'dotenv';
import { ManagerEntities, ManagerModule } from './manager/manager.module';
import { MessagerModule, Entities as MessageEntities } from './messager/messager.module';
import { ProdutoModule, ProcutEntities as ProdutoEntities } from './produto/produto.module';
import { CodexModule, CodeXEntities } from './codex/codex.module';
import { GlobalizationEntities, GlobalizationModule } from './globalization/globalization.module';
import { PranchetaEntities, PranchetaModule } from './prancheta/prancheta.module';
import { IconEntities, IconsModule } from './icons/icons.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TenantEntities, TenantModule } from './tenant/tenant.module';
import { UsersModule } from './users/users.module';

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
      namingStrategy: new SnakeNamingStrategy(),
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
        ...TenantEntities,
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
    TenantModule,
    UsersModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
