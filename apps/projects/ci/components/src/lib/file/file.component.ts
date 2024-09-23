import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
import { MatCardModule } from '@angular/material/card'
@Component({
    selector: 'ci-file',
    template: `
        <mat-card>
            @if(title){{{title}}}
        </mat-card>
    `,
    styles: [
        `:host{
            display: flex;
            flex-direction: column;
        }
        mat-card{
            flex:auto;
            overflow: hidden;
        }
        `
    ],
    standalone: true,
    imports: [
        CoreModule,
        MatCardModule,
    ]
})
export class FileComponent {
    @Input() title?: string;
    @Input() description?: string;
}