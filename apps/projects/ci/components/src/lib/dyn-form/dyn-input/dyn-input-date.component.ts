import { Component, Input, Type } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "@ci/core";



@Component({
    selector: 'ci-dyn-input-date',
    template: `
        <mat-form-field>
            <mat-label>{{label || placeholder || ''}}</mat-label>
            <input matInput type="text" [placeholder]="placeholder || label || ''"  >
            @if(isArray){<button matSuffix mat-icon-button>
                <mat-icon>edit</mat-icon>
            </button>}
        </mat-form-field>
        `,
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
    ],
    styles: ':host{display:contents;}'
})
export class DynInputDateComponent {
    @Input() fieldName?: string;
    @Input() label?: string;
    @Input() placeholder?: string;
    @Input() hint?: string;
    @Input() formControl?: FormControl;
    @Input() formGroup?: FormGroup;
    @Input() inputComponent?: Type<any>;
    @Input() type?: string;
    @Input() isArray?: boolean;
    constructor() { }
}