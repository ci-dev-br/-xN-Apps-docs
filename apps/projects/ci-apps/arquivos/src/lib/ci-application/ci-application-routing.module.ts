import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { FilesComponent } from './files/files.component'
const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: '', component: FilesComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
