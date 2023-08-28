import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomepageRoutingModule } from './homepage-routing.module';
import { HomepageComponent } from './homepage.component';
import { CoreModule } from 'src/app/core/core.module';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { LFooterModule } from 'src/app/components/l-footer/l-footer.module';


@NgModule({
  declarations: [
    HomepageComponent
  ],
  imports: [
    CoreModule,
    HomepageRoutingModule,
    LNavModule,
    LFooterModule,
  ]
})
export class HomepageModule { }
