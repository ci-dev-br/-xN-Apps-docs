import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Home', loadChildren: () => import('./../views/home/home.module').then(m => m.HomeModule) },
  {
    path: 'Editor',
    loadChildren: () => import('./../views/svg-editor/svg-editor.module').then(m => m.SvgEditorModule),
    data: {
      appName: 'Icons',
      title: 'Editor Vetorial & Imagens (Icons)',
      icon: 'palette',
      description: 'Editor e visualizador de ícones SVG e imagens rasterizadas',
      queryParam: 'file',
      files: [{ format: 'png' }, { format: 'jpg' }, { format: 'svg' }, { format: 'webp' }, { format: 'ico' }],
      manifest: {
        'event:open:*.svg': {
          label: 'Editar Vetor SVG no Icons Editor',
          icon: 'draw',
          queryParam: 'file',
        },
        'event:open:*.png,*.jpg,*.jpeg,*.webp,*.ico': {
          label: 'Visualizar/Editar Imagem no Icons',
          icon: 'image',
          queryParam: 'file',
        },
      }
    }
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }

