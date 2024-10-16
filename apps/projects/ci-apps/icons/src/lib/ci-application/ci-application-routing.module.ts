import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Home', loadChildren: () => import('./../views/home/home.module').then(m => m.HomeModule) },
  { path: 'Editor', loadChildren: () => import('./../views/svg-editor/svg-editor.module').then(m => m.SvgEditorModule) },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
