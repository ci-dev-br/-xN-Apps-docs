import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from "@angular/material/icon";
@Component({
    selector: 'ci-file',
    template: `
        <mat-card>
            @if(image){<img mat-card-image [src]="image" >}
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
        `
    ],
    standalone: true,
    imports: [
        CoreModule,
        MatCardModule,
        MatIconModule,
    ]
})
export class FileComponent {
    @Input() icon?: string;
    @Input() image?: string;
    @Input() title?: string;
    @Input() description?: string;
}