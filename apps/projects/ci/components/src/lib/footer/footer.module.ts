import { NgModule } from "@angular/core";
import { CoreModule } from "@ci/core";
import { Footer } from "./footer.component";

@NgModule({
    imports: [
        CoreModule,
    ],
    declarations: [
        Footer,
    ],
    exports: [Footer,]
})
export class FooterModule { }
export {
    Footer,
}