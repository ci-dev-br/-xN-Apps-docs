import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
// import { BrandingComponent } from './branding/branding.component';
import { models } from '../models';
import { MasterDetailComponent } from '@ci/components/master-detail';
import { RouteFromSchema } from '@ci/core';
const routes: Routes = [
  /* {
    path: '', component: HomeComponent, children: [
      { path: '', component: BrandingComponent },
      { path: 'branding', component: BrandingComponent }
    ]
  }, */
  {
    path: '', component: HomeComponent, children: [
      ...models.map(c => {
        return RouteFromSchema(c, MasterDetailComponent)
      })
    ],
    title: 'Apps :: Projetos'
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
