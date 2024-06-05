import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InboxComponent } from "./inbox/inbox.component";
@NgModule({
    imports: [
        RouterModule.forChild([{
            path: '', component: InboxComponent, data: {
                title: 'Mensagens e Conversas'
            }
        }]),
    ],
})
export class MensagensModule { }