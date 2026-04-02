import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioHomeComponent } from './fomulario-home/fomulario-home.component'
const routes: Routes = [
  {
    path: '',
    component: FormularioHomeComponent,
    children: []
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
