import { NgModule } from "@angular/core";
import { JsonToTsService } from "./json-to-ts.service";
@NgModule({
    providers: [
        JsonToTsService
    ],
    exports: [
    ]
})
export class CiCdkModule { }
export {
    JsonToTsService
}