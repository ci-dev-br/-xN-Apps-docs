import { NgModule } from "@angular/core";
import { ThreejsComponent } from "./threejs.component";
import { CommonModule } from "@angular/common";
import { ThreejsRoutingModule } from "./threejs-routing.module";
import { LNavModule } from "src/app/components/l-nav/l-nav.module";

@NgModule({
    imports: [
        CommonModule,
        ThreejsRoutingModule,
        LNavModule,
    ],
    declarations: [ThreejsComponent],
    exports: [ThreejsComponent],
})
export class ThreejsModule { }