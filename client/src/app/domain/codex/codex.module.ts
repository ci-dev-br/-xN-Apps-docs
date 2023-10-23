import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodexRoutingModule } from './codex-routing.module';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    CodeEditorComponent
  ],
  imports: [
    CommonModule,
    CodexRoutingModule,
    LNavModule,
    FormsModule,
    MonacoEditorModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class CodexModule { }
