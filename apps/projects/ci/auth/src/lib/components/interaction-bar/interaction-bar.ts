import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";




@Component({
    imports: [
        CommonModule,
    ],
    templateUrl: 'interaction-bar.html'
})
export class InteractionBar {
    @Input()
    source?: any;
}