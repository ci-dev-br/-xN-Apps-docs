import { NgModule } from "@angular/core";
import { AudioModemService } from "./aio.service";
import { AIOChatComponent } from "./aio.component";
import { CoreModule } from "@ci/core";
import { FormsModule } from "@angular/forms";
@NgModule({
    imports: [
        CoreModule,
        FormsModule,
    ],
    exports: [
    AIOChatComponent,
    ],
    declarations: [
        AIOChatComponent,
    ],
    providers: [
        AudioModemService,
    ]
})
export class AIOModule { }
export {
    AudioModemService,
    AIOChatComponent
}