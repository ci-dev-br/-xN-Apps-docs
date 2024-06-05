import { EnvironmentProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage/storage.service';
import { CoreService } from './core.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [
    StorageService,
    CoreService,
  ],
  exports: [
    CommonModule,
  ]
})
export class CoreModule { }