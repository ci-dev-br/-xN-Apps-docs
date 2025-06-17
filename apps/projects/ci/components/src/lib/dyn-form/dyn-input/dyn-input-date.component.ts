import { Component, Input, Type } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: 'ci-dyn-input-date',
    standalone: false,
    template: `
        <mat-form-field>
            <mat-label>{{label || placeholder || ''}}</mat-label>
            <input matInput type="text" [placeholder]="placeholder || label || ''"  >
            @if(isArray){<button matSuffix mat-icon-button>
                <mat-icon>edit</mat-icon>
            </button>}
        </mat-form-field>
        `,
    /* standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
    ], */
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