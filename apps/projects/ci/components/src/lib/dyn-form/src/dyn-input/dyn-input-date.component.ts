import { Component, Input, Type } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: 'ci-dyn-input-date',
    standalone: false,
    templateUrl: 'dyn-input-date.component.html',
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
    @Input() format?: string;
    @Input() isArray?: boolean;
    constructor() { }
}