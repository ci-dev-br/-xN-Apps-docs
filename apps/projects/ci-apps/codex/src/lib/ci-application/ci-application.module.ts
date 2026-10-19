import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { Files } from './services/files.service';
import { MonacoWorkspaceService } from './code-editor/monaco-workspace.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CiApplicationRoutingModule
  ],
  providers: [
    Files,
    MonacoWorkspaceService,
  ]
})
export class CiApplicationModule { }
