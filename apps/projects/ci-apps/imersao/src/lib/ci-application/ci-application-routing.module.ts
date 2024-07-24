import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { InfiltradoComponent } from '../infiltrado/infiltrado.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Infiltrado', component: InfiltradoComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
