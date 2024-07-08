import { EnvironmentProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage/storage.service';
import { CoreService } from './core.service';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DaoService, IChangeable } from './dao/dao.service';
import { ServicesService } from './services/services.service';
import { Localizacao } from './models/localozacao';
import { DAN } from './services/dan.service';
import { AutoScollDirective } from './directives/auto-scroll.directive';

@NgModule({
  declarations: [
    AutoFocusDirective,
    AutoScollDirective,
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    StorageService,
    CoreService,
    DaoService,
    ServicesService,
    DAN,
  ],
  exports: [
    CommonModule,
    AutoFocusDirective,
    AutoScollDirective,
  ]
})
export class CoreModule { }
export {
  AutoFocusDirective,
  CoreService,
  StorageService,
  DaoService,
  IChangeable,
  ServicesService,
  Localizacao,
}