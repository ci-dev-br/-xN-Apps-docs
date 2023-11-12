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
import { StorageEntities, StorageModule } from './storage/storage.module';
import { CoreEntities, CoreModule } from './core/core.module';
import { ProlaboreEntities } from './prolabore/prolabore.module';
import { CadastroEntidades, CasdastroModule } from './cadastro/cadastro.module';
import { PaymentEntities, PaymentModule } from './payment/payment.module';
import { FiscalEntities, FiscalModule } from './fiscal/fiscal.module';

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
      loggerLevel: 'warn',
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
        ...StorageEntities,
        ...CoreEntities,
        ...ProlaboreEntities,
        ...CadastroEntidades,
        ...PaymentEntities,
        ...FiscalEntities,
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
    StorageModule,
    CasdastroModule,
    PaymentModule,
    FiscalModule,
    CoreModule.forRoot({
      snapshot: true
    })
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,

  ],
})
export class AppModule { }
