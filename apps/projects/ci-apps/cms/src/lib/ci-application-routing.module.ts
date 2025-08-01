import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { CMSComponent } from './cms/cms.component';
import { MasterDetailComponent } from '@ci/components';
import { models } from './models';
// import { MasterDetailComponent } from '../../../cadastros/src/lib/cadastros/master-detail/master-detail.component';

const routes: Routes = [
  {
    path: '', component: CMSComponent, children: [
      ...models.map(c => {
        return {
          path: `${c}`, component: MasterDetailComponent, data: {
            schema: `${c}`, title: `${c}`, icon: `svg:${c}`,
          }
        } as Route
      })
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
