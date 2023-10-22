import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodexRoutingModule } from './codex-routing.module';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';


@NgModule({
  declarations: [
    CodeEditorComponent
  ],
  imports: [
    CommonModule,
    CodexRoutingModule,
    LNavModule,
  ]
})
export class CodexModule { }
