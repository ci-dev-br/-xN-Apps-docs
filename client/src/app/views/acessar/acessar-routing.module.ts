import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcessarComponent } from './acessar.component';

const routes: Routes = [
  { path: '', component: AcessarComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcessarRoutingModule { }
