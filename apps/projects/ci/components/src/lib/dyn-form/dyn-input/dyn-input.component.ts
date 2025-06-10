import { Component, Input, Type } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { DynInputDateComponent } from "./dyn-input-date.component";
import { CoreModule } from "@ci/core";

const types: any = {
    'Date': DynInputDateComponent
}

@Component({
    selector: 'ci-dyn-input',
    standalone: true,
    imports: [
        CoreModule,
        MatFormFieldModule,
        MatInputModule,
        DynInputDateComponent,
        ReactiveFormsModule,
    ],
    template: `
    @if(!!formGroup && !!fieldName){<form style="display:contents" [formGroup]="formGroup">
        @if(inputComponent !== undefined && !!inputComponent){
            <ng-container *ngComponentOutlet="inputComponent" ></ng-container>
        }
        @else{
            <mat-form-field>
                <mat-label>{{label || placeholder || ''}}</mat-label>
                <input matInput type="text" [placeholder]="placeholder || label || ''" [formControlName]="fieldName || ''"  >
            </mat-form-field>
        }
    </form>}
    `,
    styleUrl: 'dyn-input.component.scss'
})
export class DynInputComponent {
    @Input() fieldName?: string;
    @Input() label?: string;
    @Input() placeholder?: string;
    @Input() hint?: string;
    @Input() formControl?: FormControl;
    @Input() formGroup?: FormGroup;
    @Input() inputComponent?: Type<any>;
    private _type?: string | undefined;
    public get type(): string | undefined {
        return this._type;
    }
    @Input()
    public set type(value: string | undefined) {
        if (this._type === value) return;
        this._type = value;
        if (!!value && !!types[value])
            this.inputComponent = types[value];
    }
    constructor() {

    }
}