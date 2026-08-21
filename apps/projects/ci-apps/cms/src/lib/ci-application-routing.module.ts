import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { CMSComponent } from './cms/cms.component';
import { MasterDetailComponent } from '@ci/components/master-detail';
import { models } from './models';
import { BoardComponent } from '@ci/components';
const routes: Routes = [
  {
    path: '', component: CMSComponent, children: [
      {
        path: '',
        component: BoardComponent, data: {
          title: 'CMS',
          icon: 'dashboard',
          DefaultBoard: 'CMS'
        }
      },
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
