import { NgModule } from "@angular/core";
import { PostComponent } from "./post.component";
import { CoreModule } from "@ci/core";

@NgModule({
    imports: [
        CoreModule,
    ],
    declarations: [
        PostComponent,
    ],
    exports: [
        PostComponent,
    ]
})
export class PostModule { }