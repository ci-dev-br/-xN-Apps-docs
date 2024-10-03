import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'edit', loadChildren: () => import('./edit/edit.module').then(m => m.EditModule) },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
