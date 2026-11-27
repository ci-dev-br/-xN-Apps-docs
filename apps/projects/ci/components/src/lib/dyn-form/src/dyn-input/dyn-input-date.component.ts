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
    @Input() description?: string;
    @Input() placeholder?: string;
    @Input() hint?: string;
    @Input() parentFormControl?: FormControl;
    @Input() formGroup?: FormGroup;
    @Input() inputComponent?: Type<any>;
    @Input() type?: string;
    @Input() format?: string;
    @Input() isArray?: boolean;

    constructor() { }

    get htmlInputType(): 'date' | 'datetime-local' | 'time' {
        const mode = (this.format || this.type || 'date').toLowerCase();
        if (mode === 'time') return 'time';
        if (mode === 'date-time' || mode === 'datetime' || mode === 'datetime-local') {
            return 'datetime-local';
        }
        return 'date';
    }

    get formattedControlValue(): string {
        const ctrl = this.parentFormControl || (this.fieldName ? this.formGroup?.get(this.fieldName) : null);
        const val = ctrl?.value;
        if (!val) return '';
        if (val instanceof Date && !isNaN(val.getTime())) {
            const iso = val.toISOString();
            if (this.htmlInputType === 'date') return iso.slice(0, 10);
            if (this.htmlInputType === 'datetime-local') return iso.slice(0, 16);
            return iso.slice(11, 16);
        }
        const str = String(val);
        if (this.htmlInputType === 'date' && str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) {
            return str.slice(0, 10);
        }
        if (this.htmlInputType === 'datetime-local' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
            return str.slice(0, 16);
        }
        return str;
    }

    onDateInputChange(rawValue: string): void {
        const ctrl = this.parentFormControl || (this.fieldName ? this.formGroup?.get(this.fieldName) : null);
        if (!ctrl) return;
        ctrl.setValue(rawValue || null);
        ctrl.markAsDirty();
    }
}
