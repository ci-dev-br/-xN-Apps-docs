import { NgModule } from "@angular/core";
import { StageDirective } from "../core.module";
import { StageService } from "./stage.service";


@NgModule({
    providers: [
        StageService,
    ]
})
export class StageModule { }
export {
    StageDirective,
    StageService,
}