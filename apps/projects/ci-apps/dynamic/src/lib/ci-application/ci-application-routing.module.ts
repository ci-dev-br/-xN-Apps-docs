import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentPreviewComponent } from '../component-preview/component-preview.component';
import { HomeComponent } from './home/home.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'preview', component: ComponentPreviewComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
