import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    IconComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [
    IconComponent
  ]
})
export class IconModule {
  /*  public static forChild(icons?: {
     [iconName: string]: {
       mode?: 'svg' | 'img',
       url_assets?: string,
     }
   }): ModuleWithProviders<IconModule> {
     return {
       ngModule: IconModule,
       providers: [
         { provide: ':ICONS:', multi: true, useValue: icons }
       ]
     }
   } */
}

export {
  IconComponent
}
