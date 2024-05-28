import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeoComponent } from './seo.component';

const routes: Routes = [
  {
    path: '',
    component: SeoComponent,
    data: {
      name: "SEO",
      icon: 'travel_explore'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeoRoutingModule { }
