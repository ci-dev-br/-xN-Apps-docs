import { Component } from "@angular/core";
import { CoreModule } from "src/app/core/core.module";

@Component({
    selector: 'ci-card-actions',
    template: `<ng-content></ng-content>`,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class CardActionsComponent {

}