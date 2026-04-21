import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage/storage.service';
import { CoreService } from './core.service';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DaoService } from './dao/dao.service';
import { ServicesService } from './services/services.service';
import { Localizacao } from './models/localozacao';
import { AutoScollDirective } from './directives/auto-scroll.directive';
import { ConsoleService } from './services/console.service';
import { ThemeService } from './theme/theme.service';
import { WsService } from './io/ws.service';
import { SafePipe } from './pipes/safe.pipe';
import { ContextMenuServices } from './contextmenu/contextmenu.service';
import { DaoBuilder, ISchema, ISchemaProperty } from './dao/dao-builder.service';
import { DaoPipe } from './pipes/dao.pipe';
import { StageDirective } from './directives/stage.directive';
import { IChangeable, OfString, SerializedObjectData } from './dao/models';
import { AtOf, Handlers } from './services/handlers.service';

@NgModule({
  declarations: [
    AutoFocusDirective,
    AutoScollDirective,
    DaoPipe,
    StageDirective,
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
    ConsoleService,
    ContextMenuServices,
    DaoBuilder,
  ],
  exports: [
    SafePipe,
    DaoPipe,
    CommonModule,
    AutoFocusDirective,
    AutoScollDirective,
    StageDirective,
  ]
})
export class CoreModule { }
export {
  AutoFocusDirective,
  CoreService,
  DaoService,
  DaoBuilder,
  DaoPipe,
  IChangeable,
  SerializedObjectData,
  OfString,
  ISchemaProperty,
  ISchema,
  Localizacao,
  StageDirective,
  StorageService,
  ServicesService,
  SafePipe,
  ThemeService,
  WsService,
  Handlers,
  AtOf,
}
