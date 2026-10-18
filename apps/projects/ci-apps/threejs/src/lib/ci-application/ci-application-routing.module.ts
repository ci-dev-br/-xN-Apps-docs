import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      appName: 'Threejs',
      title: 'Estúdio 3D (Three.js)',
      icon: 'view_in_ar',
      description: 'Visualizador e editor de cenas e modelos 3D',
      queryParam: 'file',
      manifest: {
        'event:open:*.glb,*.gltf,*.obj,*.fbx,*.stl': {
          component: HomeComponent,
          label: 'Abrir Modelo 3D no Three.js',
          icon: 'view_in_ar',
          queryParam: 'file',
        },
      }
    }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }

