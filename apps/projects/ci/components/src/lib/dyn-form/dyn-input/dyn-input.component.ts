import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: 'ci-dyn-input',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
    ],
    template: `
        <mat-form-field>
            <mat-label>{{label || placeholder || ''}}</mat-label>
            <input matInput type="text" [placeholder]="placeholder || label || ''"  >
        </mat-form-field>
    `,
    styleUrl: 'dyn-input.component.scss'
})
export class DynInputComponent {
    @Input() type?: string;
    @Input() fieldName?: string;
    @Input() label?: string;
    @Input() placeholder?: string;
    @Input() hint?: string;
    @Input() formControl?: FormControl;
    @Input() formGroup?: FormGroup;
    constructor() { }
}