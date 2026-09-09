import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage.component';
import { ComentariosComponent } from './comentarios/comentarios';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  {
    path: ':postId/comment',
    component: ComentariosComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomepageRoutingModule { }
