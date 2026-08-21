import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterDetailComponent } from '@ci/components/master-detail';
const routes: Routes = [
  {
    path: '', component: MasterDetailComponent, data: {
      schema: 'Product', title: 'Produtos', icon: 'product'
    }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
