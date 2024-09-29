import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


@Component({
    standalone: true,
    imports: [
        CoreModule,
        MatCardModule,
        MatIconModule,
    ],
    selector: 'ci-file',
    template: `
        <mat-card>
            @if(image){<img mat-card-image [src]="image" />}
            @if(view){<iframe mat-card-image [src]="view | safe" ></iframe>}
            @if(title){{{title}}}
            @if(icon){<mat-icon>{{icon}}</mat-icon>}
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
        iframe{
            // overflow: hidden;
            border: none;
            transform: scale(.25);
            width: 400%;
            height: 400%;
            margin: -150%;
            pointer-events: none;
            user-select: none;
        }
        `
    ],

})
export class FileComponent {
    @Input() icon?: string;
    @Input() image?: string;
    @Input() title?: string;
    @Input() view?: string | undefined;
    @Input() description?: string;
    constructor(
        private readonly s: DomSanitizer
    ) { }
}