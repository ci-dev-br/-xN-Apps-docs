import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Entities as NotificacaoEntities, NotificacaoModule } from '../libs/notification/src/notificacao.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthEntities as AuthEntities } from '../libs/auth/src/auth.module';
import { config } from 'dotenv';
import { ManagerEntities, ManagerModule } from '../libs/manager/src/manager.module';
import { MessagerModule, Entities as MessageEntities } from '../libs/messager/src/messager.module';
import { ProdutoModule, ProductEntities } from '../libs/produto/src/produto.module';
import { CodexModule, CodeXEntities } from '../libs/codex/src/codex.module';
import { GlobalizationEntities, GlobalizationModule } from '../libs/g11n/src/globalization.module';
import { PranchetaEntities, PranchetaModule } from '../libs/prancheta/src/prancheta.module';
import { IconEntities, IconsModule } from '../libs/icons/src/icons.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TenantEntities, TenantModule } from '../libs/tenant/src/tenant.module';
import { UsersModule } from '../libs/user/src/users.module';
import { StorageEntities, StorageModule } from '../libs/storage/src/storage.module';
import { CoreEntities, CoreModule } from '../libs/core/src/core.module';
import { ProlaboreEntities } from '../libs/prolabore/src/prolabore.module';
import { CadastroEntidades, CasdastroModule } from '../libs/cadastro/src/cadastro.module';
import { PaymentEntities, PaymentModule } from '../libs/payment/src/payment.module';
import { FiscalEntities, FiscalModule } from '@ci/fiscal';
import { InfraEntities, InfraModule } from '@ci/core/infra/infra.module';
import { SystemEntities, SystemModule } from '@ci/core/system/system.module';
import { FinanceiroEntities, FinanceiroModule } from '../libs/financeiro/src/financeiro.module';
import { OrganizacaoEntities, OrganizacaoModule } from '../libs/organizacao/src/organizacao.module';
import { INPIEntities, INPIModule } from '../libs/inpi/src/inpi.module';
import { SeoMarketingEntities, SeoMarketingModule } from '@ci/seo-marketing';
const is_production = !!process.execArgv.find(arg => arg === '--prod');
config({ path: is_production ? '.env' : '.env.dev' });
const LoadedEntities = [
];
const LoadedModules = [
]
const _entities_name = {
  Notificacao: NotificacaoEntities,
  Auth: AuthEntities,
  Manager: ManagerEntities,
  Message: MessageEntities,
  Product: ProductEntities,
  CodeX: CodeXEntities,
  Globalization: GlobalizationEntities,
  Prancheta: PranchetaEntities,
  Icons: IconEntities,
  Tenant: TenantEntities,
  Storage: StorageEntities,
  Core: CoreEntities,
  Prolabore: ProlaboreEntities,
  Cadastro: CadastroEntidades,
  Payment: PaymentEntities,
  Fiscal: FiscalEntities,
  Infra: InfraEntities,
  System: SystemEntities,
  Financeiro: FinanceiroEntities,
  Organizacao: OrganizacaoEntities,
  INPI: INPIEntities,
  SeoMarketing: SeoMarketingEntities,
}
const _modules_name = {
  System: SystemModule,
  Notificacao: NotificacaoModule,
  Auth: AuthModule,
  Manager: ManagerModule,
  Messager: MessagerModule,
  Produto: ProdutoModule,
  Codex: CodexModule,
  Globalization: GlobalizationModule,
  Prancheta: PranchetaModule,
  Icons: IconsModule,
  Tenant: TenantModule,
  Users: UsersModule,
  Storage: StorageModule,
  Casdastro: CasdastroModule,
  Payment: PaymentModule,
  Fiscal: FiscalModule,
  Infra: InfraModule,
  Financeiro: FinanceiroModule,
  Organizacao: OrganizacaoModule,
  INPI: INPIModule,
  SeoMarketing: SeoMarketingModule,
}
process.env.MODULES.split(',').forEach(e => {
  if (_entities_name[e]) LoadedEntities.push(..._entities_name[e]);
  if (_modules_name[e]) LoadedModules.push(_modules_name[e]);
})
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
        ...LoadedEntities
      ]
    }),
    CoreModule.forRoot({
      snapshot: true
    }),
    ...LoadedModules,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
