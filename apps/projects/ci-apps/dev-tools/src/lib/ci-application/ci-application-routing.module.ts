import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      appName: 'DevTools',
      title: 'DevTools Inspector',
      icon: 'terminal',
      description: 'Inspeção técnica de código, configurações JSON, logs e ambiente',
      queryParam: 'file',
      manifest: {
        'event:open:*.ts,*.js,*.json,*.env,*.log,*.yml,*.yaml': {
          component: HomeComponent,
          label: 'Inspecionar no DevTools',
          icon: 'bug_report',
          queryParam: 'file',
        },
      }
    }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }

