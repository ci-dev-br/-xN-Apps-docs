import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { BoardComponent } from '@ci/components';
import { MasterDetailComponent } from '@ci/components/master-detail';
import { SeoComponent } from '../seo/seo.component';
import { SeoDashboardComponent } from '../dashboard/seo-dashboard.component';
import { models } from '../models';

const routes: Routes = [
  {
    path: '',
    component: SeoComponent,
    children: [
      {
        path: '',
        component: SeoDashboardComponent,
      },
      {
        path: 'board',
        component: BoardComponent,
        data: {
          appName: 'SEO',
          title: 'SEO — Painel Customizável',
          icon: 'travel_explore',
          DefaultBoard: 'br.ci.dev.SEO.Board',
        },
      },
      ...models.map(c => {
        return {
          path: `${c}`,
          component: MasterDetailComponent,
          data: {
            schema: `${c}`,
            title: `${c}`,
            icon: `svg:${c}`,
          },
        } as Route;
      }),
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CiApplicationRoutingModule { }
