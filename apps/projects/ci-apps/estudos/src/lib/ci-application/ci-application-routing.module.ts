import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstudosComponent } from '../estudos.component';

const routes: Routes = [
  { path: '', component: EstudosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
