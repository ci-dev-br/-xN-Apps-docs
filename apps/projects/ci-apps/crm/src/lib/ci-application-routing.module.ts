import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { CrmComponent } from './crm/crm.component';
import { CrmDashboardComponent } from './dashboard/crm-dashboard.component';
import { models } from './models';
import { MasterDetailComponent } from '@ci/components/master-detail';

const routes: Routes = [
  {
    path: '', component: CrmComponent, children: [
      {
        path: '',
        component: CrmDashboardComponent
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
