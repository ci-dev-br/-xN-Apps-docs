import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { Principal } from './principal/principal';
const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      {
        path: '', component: Principal, pathMatch: 'full',
        title: 'Principal',
        data: {
          roles: ['USER', 'ADMIN'],
        }
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
