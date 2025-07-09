import { Component, Injector, Input, Optional, Type } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { DynInputDateComponent } from "./dyn-input-date.component";
import { DaoBuilder, DaoService } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

const types: any = {
    'Date': DynInputDateComponent
}

@Component({
    selector: 'ci-dyn-input',
    standalone: false,
    template: `
    @if(!!formGroup && !!fieldName){<form style="display:contents" [formGroup]="formGroup">
        @if(inputComponent !== undefined && !!inputComponent){
            <ng-container *ngComponentOutlet="inputComponent" ></ng-container>
        }
        @else{
            <!-- 
                Defafault Input Implementation
            -->
                @if(type === 'html'){
                    HTML CONTENT
                }@else {
                    <mat-form-field>
                        <mat-label>{{label || placeholder || ''}}</mat-label>
                        @if(!!service){
                            <input matInput type="text" 
                                [placeholder]="placeholder || label || ''" 
                                [formControlName]="fieldName || ''"  
                                [matAutocomplete]="autoc"  
                            >
                            <mat-autocomplete #autoc="matAutocomplete">
                             @for (option of list; track option) {
                                 <mat-option [value]="option">{{option | dao}}</mat-option>
                             }    
                            </mat-autocomplete>
                        }@else{
                            <input matInput type="text" 
                                autocomplete="off"
                                [placeholder]="placeholder || label || ''" 
                                [formControlName]="fieldName || ''"  
                            >
                        }
                        @if(!!schemaName){<button mat-icon-button matSuffix>
                            <mat-icon>
                                search
                            </mat-icon>
                        </button>}
                    </mat-form-field>
                }
        }
    </form>
    @if(false){  <ci-dyn-input-date></ci-dyn-input-date>}
}
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
    @Input() isArray?: boolean;
    private _schemaName?: string | undefined;
    public get schemaName(): string | undefined {
        return this._schemaName;
    }
    @Input()
    public set schemaName(value: string | undefined) {
        if (this._schemaName === value) return;
        this._schemaName = value;

        if (!!this._schemaName) {
            let serviceType = getServiceAsSchema(this._schemaName);
            if (serviceType) {
                this.service = this.injector.get(serviceType);
                if (this.fieldName) this.formGroup?.get(this.fieldName)?.valueChanges.subscribe(async v => {
                    if (typeof v === 'string') {
                        if (this.service && this.service.getList)
                            this.list = await this.daos?.read(await lastValueFrom(this.service.getList()));
                        this.list;
                    } else {
                        v;
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