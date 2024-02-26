/* tslint:disable */
/* eslint-disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { ApiService } from './services/api.service';
import { DeviceService } from './services/device.service';
import { AuthService } from './services/auth.service';
import { ApplicationService } from './services/application.service';
import { PranchetaService } from './services/prancheta.service';
import { UserService } from './services/user.service';
import { PhotoService } from './services/photo.service';
import { CadastroService } from './services/cadastro.service';
import { PessoaService } from './services/pessoa.service';
import { OrganizacaoService } from './services/organizacao.service';

/**
 * Module that provides all services and configuration.
 */
@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    ApiService,
    DeviceService,
    AuthService,
    ApplicationService,
    PranchetaService,
    UserService,
    PhotoService,
    CadastroService,
    PessoaService,
    OrganizacaoService,
    ApiConfiguration
  ],
})
export class ApiModule {
  static forRoot(params: ApiConfigurationParams): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [
        {
          provide: ApiConfiguration,
          useValue: params
        }
      ]
    }
  }

  constructor( 
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
      'See also https://github.com/angular/angular/issues/20575');
    }
  }
}
