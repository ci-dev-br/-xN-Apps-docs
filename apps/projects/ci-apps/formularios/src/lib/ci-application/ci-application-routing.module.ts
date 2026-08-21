import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioHomeComponent } from './formulario-home/formulario-home.component'
import { FormularioEditComponent } from './fomulario-edit/fomulario-edit.component';
const routes: Routes = [
  {
    path: '',
    component: FormularioHomeComponent,
    children: [
      {
        path: 'edit/:FormId',
        component: FormularioEditComponent,
      }
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
