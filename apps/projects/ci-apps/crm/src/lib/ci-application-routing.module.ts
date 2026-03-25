import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { CrmComponent } from './crm/crm.component';
import { models } from './models';
import { MasterDetailComponent } from '@ci/components';
const routes: Routes = [
  {
    path: '', component: CrmComponent, children: [
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
