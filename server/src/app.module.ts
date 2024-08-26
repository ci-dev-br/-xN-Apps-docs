import { Module } from '@nestjs/common';
import { Entities as NotificacaoEntities, NotificacaoModule } from '@ci/notification';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthEntities as AuthEntities } from '@ci/auth/auth.module';
import { ManagerEntities, ManagerModule } from '@ci/manager/manager.module';
import { MessagerModule, Entities as MessageEntities } from '@ci/messager/messager.module';
import { ProdutoModule, ProductEntities } from '@ci/produto/produto.module';
import { CodexModule, CodeXEntities } from '@ci/codex/codex.module';
import { GlobalizationEntities, GlobalizationModule } from '@ci/g11n/globalization.module';
import { PranchetaEntities, PranchetaModule } from '@ci/prancheta/prancheta.module';
import { IconEntities, IconsModule } from '@ci/icons/icons.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TenantEntities, TenantModule } from '@ci/tenant/tenant.module';
import { UsersModule } from '@ci/user/users.module';
import { StorageEntities, StorageModule } from '@ci/storage/storage.module';
import { CoreEntities, CoreModule } from '@ci/core/core.module';
import { ProlaboreEntities } from '@ci/prolabore/prolabore.module';
import { CadastroEntidades, CasdastroModule } from '@ci/cadastro/cadastro.module';
import { PaymentEntities, PaymentModule } from '@ci/payment/payment.module';
import { FiscalEntities, FiscalModule } from '@ci/fiscal';
import { InfraEntities, InfraModule } from '@ci/core/infra/infra.module';
import { SystemEntities, SystemModule } from '@ci/core/system/system.module';
import { FinanceiroEntities, FinanceiroModule } from '@ci/financeiro/financeiro.module';
import { OrganizacaoEntities, OrganizacaoModule } from '@ci/organizacao/organizacao.module';
import { INPIEntities, INPIModule } from '@ci/inpi/inpi.module';
import { SeoMarketingEntities, SeoMarketingModule } from '@ci/seo-marketing';
import { config } from 'dotenv';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
      dropSchema: false,
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
