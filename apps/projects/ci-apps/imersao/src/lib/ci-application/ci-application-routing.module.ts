import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ThrejsComponent } from '@ci/espazio';
// import { HomeComponent } from './home/home.component'
// import { InfiltradoComponent } from '../infiltrado/infiltrado.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Espazio', component: ThrejsComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
