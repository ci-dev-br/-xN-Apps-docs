import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './blog.component';
import { PostComponent } from './post/post.component';
const routes: Routes = [
  {
    path: '', component: BlogComponent,
    data: {
      TopActions: [
        {
          label: 'Criar Post',
          icon: 'create',
          component: PostComponent
        },
      ]
    }
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
