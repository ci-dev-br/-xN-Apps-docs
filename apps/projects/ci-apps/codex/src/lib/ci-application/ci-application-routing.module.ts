import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { HomepageComponent } from './homepage/homepage.component';
import { NavigationComponent } from './navigation/navigation.component';

const routes: Routes = [
  {
    path: '', component: NavigationComponent, children: [
      {
        path: '', component: HomepageComponent,
        data: {
          appName: 'Codex',
          title: 'Início (Codex)',
          icon: 'home',
          description: 'Painel inicial de projetos e arquivos do Codex',
          manifest: {
            'event:explore:directory': {
              component: HomepageComponent,
              label: 'Abrir diretório como Projeto no Codex',
              icon: 'folder_special',
              queryParam: 'path',
            },
          }
        }
      },
      {
        path: 'editor', component: CodeEditorComponent,
        data: {
          appName: 'Codex',
          title: 'Editor de Código (Codex)',
          icon: 'code',
          description: 'Editor de código-fonte e texto com suporte a TypeScript, HTML, SCSS, JSON e Markdown',
          queryParam: 'file',
          dynamicTypes: {
            ts: {
              type: 'ts',
              format: 'ts',
              filePatterns: ['*.ts', '*.tsx', '*.map'],
              label: 'TypeScript (CodeX)',
              icon: 'code',
              component: CodeEditorComponent,
              openInWindow: true,
              windowTitle: 'CodeX — Editor TypeScript',
              queryParam: 'file',
            },
            typescript: {
              type: 'typescript',
              format: 'typescript',
              filePatterns: ['*.ts', '*.tsx', '*.map'],
              label: 'TypeScript (CodeX)',
              icon: 'code',
              component: CodeEditorComponent,
              openInWindow: true,
              windowTitle: 'CodeX — Editor TypeScript',
              queryParam: 'file',
            },
            map: {
              type: 'map',
              format: 'map',
              filePatterns: ['*.map'],
              label: 'Editar .ts via SourceMap (.map) no CodeX',
              icon: 'account_tree',
              component: CodeEditorComponent,
              openInWindow: true,
              windowTitle: 'CodeX — Editar .ts via .map',
              queryParam: 'file',
            },
            codex: {
              type: 'codex',
              format: 'code',
              filePatterns: ['*.ts', '*.js', '*.json', '*.map'],
              label: 'Editor de Código (CodeX)',
              icon: 'code',
              component: CodeEditorComponent,
              openInWindow: true,
              windowTitle: 'CodeX — Editor de Código',
              queryParam: 'file',
            },
          },
          manifest: {
            'event:open:*.ts': {
              component: CodeEditorComponent,
              label: 'Editar TypeScript no Codex',
              icon: 'code',
              queryParam: 'file',
              dynamicType: 'ts',
              openInWindow: true,
              windowTitle: 'CodeX — Editor TypeScript',
            },
            'event:open:*.map': {
              component: CodeEditorComponent,
              label: 'Editar .ts via SourceMap (.map) no Codex',
              icon: 'account_tree',
              queryParam: 'file',
              dynamicType: 'map',
              openInWindow: true,
              windowTitle: 'CodeX — Editar .ts via .map',
            },
            'event:open:*.js,*.mjs,*.cjs': {
              component: CodeEditorComponent,
              label: 'Editar JavaScript no Codex',
              icon: 'javascript',
              queryParam: 'file',
            },
            'event:open:*.json': {
              component: CodeEditorComponent,
              label: 'Editar JSON no Codex',
              icon: 'data_object',
              queryParam: 'file',
            },
            'event:open:*.html': {
              component: CodeEditorComponent,
              label: 'Editar HTML no Codex',
              icon: 'html',
              queryParam: 'file',
            },
            'event:open:*.scss,*.css': {
              component: CodeEditorComponent,
              label: 'Editar Folha de Estilo no Codex',
              icon: 'css',
              queryParam: 'file',
            },
            'event:open:*.md': {
              component: CodeEditorComponent,
              label: 'Editar Markdown no Codex',
              icon: 'article',
              queryParam: 'file',
            },
            'event:open:*.svg,*.xml': {
              component: CodeEditorComponent,
              label: 'Editar Código XML/SVG no Codex',
              icon: 'code',
              queryParam: 'file',
            },
            'event:open:*.yml,*.yaml,*.env,*.sql,*.sh,*.ps1,*.txt,*.log': {
              component: CodeEditorComponent,
              label: 'Editar Script/Configuração no Codex',
              icon: 'terminal',
              queryParam: 'file',
            },
            'event:open:*': {
              component: CodeEditorComponent,
              label: 'Abrir como texto no Codex Editor',
              icon: 'code',
              queryParam: 'file',
              fallback: true,
            },
          }
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }

