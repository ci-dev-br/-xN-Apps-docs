import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";


@Component({
    standalone: true,
    imports: [
        CoreModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
    ],
    selector: 'ci-file',
    template: `
        <mat-card>
            @if(image){<img mat-card-image [src]="image" />}
            @if(view){<iframe mat-card-image [src]="view | safe" ></iframe>}
            @if(title){{{title}}}
            @if(icon){<mat-icon>{{icon}}</mat-icon>}
            <button mat-icon-button (click)="$event.stopPropagation()" [matMenuTriggerFor]="menu" >
                <mat-icon>more_vert</mat-icon>
            </button>        
            <mat-menu #menu>
                <ng-content selector="[menu]" ></ng-content>
            </mat-menu>
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