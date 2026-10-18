import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogComponent } from './blog.component';
import { PostModule } from './post/post.module';

@NgModule({
  declarations: [
    BlogComponent
  ],
  imports: [
    CommonModule,
    PostModule,
    BlogRoutingModule
  ],
  exports: [
    BlogComponent,
  ]
})
export class BlogModule { }
