import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CMSComponent } from './cms/cms.component';
import { RouteFromSchema } from '@ci/core';

const models = [
  'CommentMeta',
  'Comment',
  'Links',
  'SitePage',
  'SiteOption',
  'SitePost',
  'TermMeta',
  'Term',
  'Website',
]
const routes: Routes = [
  {
    path: '', component: CMSComponent, children: [
      ...models.map(c => RouteFromSchema(c))
    ],
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
