import { NgModule } from "@angular/core";
import { MessageService } from "./message.service";
import { CoreModule } from "src/app/core/core.module";
import { MatDialogModule } from "@angular/material/dialog";
import { MessageTemplateComponent } from "./message-template.component";
@NgModule({
    imports: [
        CoreModule,
        MatDialogModule,
    ],
    exports: [
    ],
    declarations: [
        MessageTemplateComponent,
    ],
    providers: [
        MessageService,
    ],
})
export class MessageModule { }
export {
    MessageService,
}