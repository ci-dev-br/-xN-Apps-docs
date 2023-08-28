import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomepageRoutingModule } from './homepage-routing.module';
import { HomepageComponent } from './homepage.component';
import { CoreModule } from 'src/app/core/core.module';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';


@NgModule({
  declarations: [
    HomepageComponent
  ],
  imports: [
    CoreModule,
    HomepageRoutingModule,
    LNavModule,
  ]
})
export class HomepageModule { }
