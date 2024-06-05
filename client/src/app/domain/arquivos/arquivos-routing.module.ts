import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArquivosComponent } from './arquivos.component';

const routes: Routes = [{ path: '', component: ArquivosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArquivosRoutingModule { }
