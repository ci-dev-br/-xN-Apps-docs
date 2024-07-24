import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { BrandingComponent } from './branding/branding.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'branding', component: BrandingComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
