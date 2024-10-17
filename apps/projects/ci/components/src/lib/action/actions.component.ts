import { Component } from "@angular/core";

@Component({
    selector: 'ci-actions',
    template: `
    <div class="container">
        <ng-content></ng-content>
    </div>
    `,
    styleUrls: [
        'actions.component.scss',
    ]
})
export class ActionsComponent {
    constructor(

    ) { }
}