import { Component, Input, Type } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "@ci/core";



@Component({
    selector: 'ci-dyn-input-date',
    template: `
        <mat-form-field>
            <mat-label>{{label || placeholder || ''}}</mat-label>
            <input matInput type="text" [placeholder]="placeholder || label || ''"  >
        </mat-form-field>
        `,
    standalone: true,
    imports: [
        CoreModule,
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
    constructor() { }
}