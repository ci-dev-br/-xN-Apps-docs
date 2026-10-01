import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MensagensComponent } from '../mensagens.component';
import { HomeComponent } from './views/home/home.component';
const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: '', component: MensagensComponent, },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
