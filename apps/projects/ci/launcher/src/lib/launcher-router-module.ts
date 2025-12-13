import { inject, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Home } from './home/home';
@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: ``, component: Home
            }
        ]),
    ],

})
export class LauncherRouterModule { }
