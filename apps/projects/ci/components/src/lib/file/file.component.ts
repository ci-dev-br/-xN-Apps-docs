import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";

@Component({
    imports: [
        CoreModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
    ],
    standalone: true,
    selector: 'ci-file',
    template: `
        <mat-card>
            @if(image){<img mat-card-image [src]="image" />}
            @else if(view){<iframe mat-card-image [src]="view | safe" ></iframe>}
            <mat-card-footer>
                @if(icon){<mat-icon>{{icon}}</mat-icon>}
                <div class="col auto">
                    @if(title){{{title}}}
                </div>
                <button mat-icon-button class="actions" (click)="$event.stopPropagation()" [matMenuTriggerFor]="menu" >
                    <mat-icon>more_vert</mat-icon>
                </button>        
                <mat-menu #menu>
                    <ng-content selector="[menu]" ></ng-content>
                </mat-menu>
            </mat-card-footer>
        </mat-card>
        
    `,
    styleUrl: 'file.component.scss'
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