import { EnvironmentProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage/storage.service';
import { CoreService } from './core.service';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DaoService, IChangeable } from './dao/dao.service';
import { ServicesService } from './services/services.service';
import { Localizacao } from './models/localozacao';
import { Damn } from './services/damn.service';
import { AutoScollDirective } from './directives/auto-scroll.directive';
import { ConsoleService } from './services/console.service';
import { ThemeService } from './theme/theme.service';
import { WsService } from './io/ws.service';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [
    AutoFocusDirective,
    AutoScollDirective,
    SafePipe,
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    StorageService,
    CoreService,
    DaoService,
    ServicesService,
    Damn,
    ConsoleService,
    // WsService,
  ],
  exports: [
    SafePipe,
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
  ThemeService,
  WsService,
  SafePipe,
}
