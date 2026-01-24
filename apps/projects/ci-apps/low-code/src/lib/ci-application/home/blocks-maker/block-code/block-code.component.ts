import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
@Component({
    selector: 'ci-code-block',
    template: `
        @if(!!description){ {{description}} }
    `,
    styleUrl: `block-code.component.scss`,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class CodeBlockComponent {
    @Input() description?: string;
    @Input() inputs?: any[];
    @Input() outputs?: any[];
    constructor() { }
}