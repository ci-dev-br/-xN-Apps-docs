import { Component, Injector, Input, Optional, Type } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { DynInputDateComponent } from "./dyn-input-date.component";
import { DynInputModulesComponent } from "./dyn-input-modules.component";
import { DynInputChipsAutocompleteComponent } from "./dyn-input-chips-autocomplete.component";
import { DaoBuilder, DaoService, IAmSchematization } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

const types: any = {
    'modules': DynInputModulesComponent,
    'app-modules': DynInputModulesComponent,
    'chips-autocomplete': DynInputChipsAutocompleteComponent,
    'modules-autocomplete': DynInputChipsAutocompleteComponent,
}

@Component({
    selector: 'ci-dyn-input',
    standalone: false,
    templateUrl: `dyn-input.component.html`,
    styleUrl: 'dyn-input.component.scss'
})
export class DynInputComponent implements IAmSchematization {
    @Input() fieldName?: string;
    @Input() label?: string;
    @Input() description?: string;
    @Input() placeholder?: string;
    @Input() hint?: string;
    @Input() formControl?: FormControl;
    @Input() formGroup?: FormGroup;
    @Input() inputComponent?: Type<any>;
    @Input() isArray?: boolean;
    @Input() format?: string;
    @Input() enumOptions?: string[];

    private _schemaName?: string | undefined;
    public get schemaName(): string {
        return this._schemaName!;
    }
    @Input()
    public set schemaName(value: string) {
        if (this._schemaName === value) return;
        this._schemaName = value;
        if (!!this._schemaName) {
            let serviceType = getServiceAsSchema(this._schemaName);
            if (serviceType) {
                this.service = this.injector.get(serviceType, null);
                if (this.fieldName) this.formGroup?.get(this.fieldName)?.valueChanges.subscribe(async v => {
                    if (typeof v === 'string') {
                        if (this.service && this.service.getList) {
                            try {
                                const raw = await lastValueFrom(this.service.getList({ body: {} }));
                                this.list = await this.daos?.read(raw, this.schemaName);
                            } catch {
                                try {
                                    const raw = await lastValueFrom(this.service.getList());
                                    this.list = await this.daos?.read(raw, this.schemaName);
                                } catch {}
                            }
                        }
                    } else {
                        /* TODO: revisar desvio */v;
                    }
                });
            }
        }
    }
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
    auto?: boolean;
    list?: any[];
    service?: any;
    constructor(
        private readonly injector: Injector,
        @Optional() private readonly daoBuilder?: DaoBuilder,
        @Optional() private readonly daos?: DaoService,
    ) { }
}
