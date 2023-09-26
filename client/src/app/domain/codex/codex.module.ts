import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodexRoutingModule } from './codex-routing.module';
import { CodeEditorComponent } from './code-editor/code-editor.component';


@NgModule({
  declarations: [
    CodeEditorComponent
  ],
  imports: [
    CommonModule,
    CodexRoutingModule
  ]
})
export class CodexModule { }
