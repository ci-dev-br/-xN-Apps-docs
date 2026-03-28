import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsComponent } from './apps.component';
import { Lista } from './lista/lista';
const routes: Routes = [
  {
    path: '', component: AppsComponent, children: [
      { path: '', component: Lista, title: 'Aplicativos' },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
