import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MasterDetailComponent } from "src/app/components/master-detail/master-detail.component";
import { MasterDetailModule } from "src/app/components/master-detail/master-detail.module";


/**
 *  Programação em baixo nível 
 * 
 */
@NgModule({
    imports: [
        MasterDetailModule,
        RouterModule.forChild([
            {
                path: '',
                component: MasterDetailComponent
            }
        ])
    ]
})
export class LowCodeModule { }