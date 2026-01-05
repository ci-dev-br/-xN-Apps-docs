import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsComponent } from './apps.component';
import { Lista } from './lista/lista';
import { BoardComponent } from '@ci/components';
const routes: Routes = [
  {
    path: '', component: AppsComponent, children: [
      { path: '', component: Lista, title: 'Aplicativos' },
      { path: 'board/:boardId', component: BoardComponent, title: 'Prancheta' },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
