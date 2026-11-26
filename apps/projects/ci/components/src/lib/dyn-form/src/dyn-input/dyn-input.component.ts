import { Component, Injector, Input, OnChanges, Optional, SimpleChanges, Type } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { Apps, DaoBuilder, DaoService, IAmSchematization, IDynamicSchemaType, ISchemaProperty } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";
import { WindowService } from "@ci/components/window";
import { lastValueFrom } from "rxjs";
import { DynInputModulesComponent } from "./dyn-input-modules.component";
import { DynInputChipsAutocompleteComponent } from "./dyn-input-chips-autocomplete.component";

const types: Record<string, Type<any>> = {
    'modules': DynInputModulesComponent,
    'app-modules': DynInputModulesComponent,
    'chips-autocomplete': DynInputChipsAutocompleteComponent,
    'modules-autocomplete': DynInputChipsAutocompleteComponent,
};

@Component({
    selector: 'ci-dyn-input',
    standalone: false,
    templateUrl: `dyn-input.component.html`,
    styleUrl: 'dyn-input.component.scss'
})
export class DynInputComponent implements IAmSchematization, OnChanges {
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
    @Input() enumOptions?: any[];
    @Input() readonly?: boolean;
    @Input() schemaProperty?: ISchemaProperty;
    @Input() data?: any;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    jsonDraft?: string;
    jsonParseError?: string;

    private _dynamicType?: IDynamicSchemaType;
    public get dynamicType(): IDynamicSchemaType | undefined {
        return this._dynamicType;
    }
    @Input()
    public set dynamicType(val: IDynamicSchemaType | undefined) {
        this._dynamicType = val;
        if (val?.component && !val.openInWindow) {
            this.inputComponent = val.component;
        }
    }

    private _schemaName?: string | undefined;
    public get schemaName(): string {
        return this._schemaName!;
    }
    @Input()
    public set schemaName(value: string) {
        if (this._schemaName === value) return;
        this._schemaName = value;
        if (!!this._schemaName) {
            const serviceType = getServiceAsSchema(this._schemaName);
            if (serviceType) {
                this.service = this.injector.get(serviceType, null);
                if (this.fieldName) {
                    this.formGroup?.get(this.fieldName)?.valueChanges.subscribe(async v => {
                        if (typeof v === 'string') {
                            await this.loadRelationList();
                        }
                    });
                }
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
        if (!!value && !!types[value]) {
            this.inputComponent = types[value];
        }
    }

    auto?: boolean;
    list?: any[];
    service?: any;

    constructor(
        private readonly injector: Injector,
        @Optional() private readonly daoBuilder?: DaoBuilder,
        @Optional() private readonly daos?: DaoService,
        @Optional() private readonly appsService?: Apps,
        @Optional() private readonly windowService?: WindowService,
    ) { }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (
            (changes['type'] || changes['format'] || changes['fieldName'] || changes['dynamicType']) &&
            !this.dynamicType &&
            this.appsService
        ) {
            const resolved = await this.appsService.resolveDynamicType({
                type: this.type,
                format: this.format,
                fieldName: this.fieldName,
                value: this.currentControl?.value,
            });
            if (resolved) {
                this.dynamicType = resolved;
            }
        }
    }

    get currentControl(): FormControl | null {
        if (this.formControl) return this.formControl;
        if (this.fieldName && this.formGroup) {
            return this.formGroup.get(this.fieldName) as FormControl | null;
        }
        return null;
    }

    get normalizedType(): string {
        if (this.type === 'chips-autocomplete' || this.format === 'chips-autocomplete' ||
            this.type === 'modules-autocomplete' || this.format === 'modules-autocomplete' ||
            this.type === 'modules' || this.type === 'app-modules' ||
            this.fieldName === 'modules' || this.fieldName === 'modulos') {
            return 'chips-autocomplete';
        }
        if (this.dynamicType) {
            return 'dynamic';
        }
        const t = (this.type || 'text').toLowerCase();
        const f = (this.format || '').toLowerCase();
        if (t === 'boolean' || t === 'checkbox') return 'boolean';
        if (t === 'date' || t === 'date-time' || t === 'time' || f === 'date' || f === 'date-time' || f === 'datetime' || f === 'time') {
            return f === 'date-time' || f === 'datetime' || t === 'date-time' ? 'date-time' : f === 'time' || t === 'time' ? 'time' : 'date';
        }
        if (this.enumOptions && this.enumOptions.length > 0 && !this.isArray) return 'option';
        if (this.enumOptions && this.enumOptions.length > 0 && this.isArray) return 'multi-option';
        if (this.isArray && !this.schemaName) return 'chips';
        if (t === 'integer') return 'integer';
        if (t === 'number') return (f === 'currency' || f === 'money') ? 'currency' : 'number';
        if (f === 'email' || t === 'email') return 'email';
        if (f === 'uri' || f === 'url' || t === 'url') return 'url';
        if (f === 'password' || t === 'password') return 'password';
        if (f === 'color' || t === 'color') return 'color';
        if (f === 'textarea' || f === 'multiline' || f === 'markdown' || f === 'html' || t === 'textarea' || t === 'html') return 'textarea';
        if (f === 'json' || t === 'json' || (t === 'object' && !this.schemaName)) return 'json';
        return 'text';
    }

    get dynamicComponentInputs(): Record<string, any> {
        return {
            ...(this.dynamicType?.inputs || {}),
            fieldName: this.fieldName,
            label: this.label,
            description: this.description,
            placeholder: this.placeholder,
            formGroup: this.formGroup,
            formControl: this.currentControl,
            value: this.currentControl?.value,
            schemaName: this.schemaName,
            schemaProperty: this.schemaProperty,
            format: this.format,
            enumOptions: this.enumOptions,
            isArray: this.isArray,
            readonly: this.readonly,
            data: this.data,
        };
    }

    get dynamicDisplayValue(): string {
        const val = this.currentControl?.value;
        if (val === null || val === undefined || val === '') return 'Nenhum conteúdo ou arquivo selecionado';
        if (typeof val === 'string') {
            return val.length > 120 ? val.slice(0, 117) + '...' : val;
        }
        try {
            const s = JSON.stringify(val);
            return s.length > 120 ? s.slice(0, 117) + '...' : s;
        } catch {
            return String(val);
        }
    }

    get arrayChips(): string[] {
        const val = this.currentControl?.value;
        if (Array.isArray(val)) return val.map(v => String(v));
        if (typeof val === 'string' && val.trim()) {
            return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    }

    addChipItem(event: MatChipInputEvent): void {
        const ctrl = this.currentControl;
        if (!ctrl) return;
        const val = (event.value || '').trim();
        if (val) {
            const next = [...this.arrayChips, val];
            ctrl.setValue(next);
            ctrl.markAsDirty();
        }
        event.chipInput?.clear();
    }

    removeChipItem(index: number): void {
        const ctrl = this.currentControl;
        if (!ctrl) return;
        const next = [...this.arrayChips];
        next.splice(index, 1);
        ctrl.setValue(next);
        ctrl.markAsDirty();
    }

    get jsonValueText(): string {
        if (this.jsonDraft !== undefined) return this.jsonDraft;
        const val = this.currentControl?.value;
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val;
        try {
            return JSON.stringify(val, null, 2);
        } catch {
            return String(val);
        }
    }

    onJsonTextChange(raw: string): void {
        this.jsonDraft = raw;
        const ctrl = this.currentControl;
        if (!ctrl) return;
        const trimmed = (raw || '').trim();
        if (!trimmed) {
            this.jsonParseError = undefined;
            ctrl.setValue(null);
            ctrl.markAsDirty();
            return;
        }
        try {
            const parsed = JSON.parse(trimmed);
            this.jsonParseError = undefined;
            ctrl.setValue(parsed);
            ctrl.markAsDirty();
        } catch {
            this.jsonParseError = 'JSON inválido';
        }
    }

    formatRelationOption = (opt: any): string => {
        if (opt === null || opt === undefined) return '';
        if (typeof opt !== 'object') return String(opt);
        return opt.nome || opt.name || opt.title || opt.label || opt.description || opt.code || opt.internalId || opt.id || '';
    };

    async loadRelationList(): Promise<void> {
        if (!this.service?.getList) return;
        try {
            const raw = await lastValueFrom(this.service.getList({ body: {} }));
            this.list = (await this.daos?.read(raw, this.schemaName)) || (Array.isArray(raw) ? raw : []);
        } catch {
            try {
                const raw = await lastValueFrom(this.service.getList());
                this.list = (await this.daos?.read(raw, this.schemaName)) || (Array.isArray(raw) ? raw : []);
            } catch {
                // ignora falha de listagem
            }
        }
    }

    async openDynamicWindow(event?: Event): Promise<void> {
        event?.stopPropagation();
        const dyn = this.dynamicType;
        if (!dyn?.component || !this.windowService) return;

        const ctrl = this.currentControl;
        const currentVal = ctrl?.value;
        const ctx = {
            fieldName: this.fieldName,
            label: this.label,
            description: this.description,
            type: this.type,
            format: this.format,
            value: currentVal,
            schemaName: this.schemaName,
            schemaProperty: this.schemaProperty,
            formGroup: this.formGroup,
            formControl: ctrl,
            data: this.data,
        };

        const isPathLike = typeof currentVal === 'string' &&
            (currentVal.endsWith('.ts') || currentVal.endsWith('.tsx') || currentVal.endsWith('.map') || currentVal.includes('/'));

        const defaultPayload: Record<string, any> = {
            fieldName: this.fieldName,
            property: this.fieldName,
            label: this.label,
            schemaName: this.schemaName,
            schemaProperty: this.schemaProperty,
            language: dyn.format === 'typescript' || dyn.type === 'ts' || dyn.type === 'typescript' || dyn.type === 'map'
                ? 'typescript'
                : dyn.format || 'typescript',
            ...(isPathLike
                ? {
                    file: currentVal,
                    filePath: currentVal,
                    ...(String(currentVal).toLowerCase().endsWith('.map') ? { mapFile: currentVal } : {}),
                }
                : {
                    value: currentVal ?? '',
                }),
            onSave: (savedInfo: { value?: string; filePath?: string; resolvedFromMap?: string }) => {
                if (!ctrl) return;
                if (isPathLike && savedInfo?.filePath) {
                    ctrl.setValue(savedInfo.filePath);
                } else if (savedInfo?.value !== undefined) {
                    ctrl.setValue(savedInfo.value);
                }
                ctrl.markAsDirty();
            },
            __windowConfig: {
                width: 'min(92vw, 1100px)',
                height: '82vh',
            },
        };

        const payload = dyn.buildWindowData ? dyn.buildWindowData(ctx) : defaultPayload;
        const title = dyn.windowTitle || dyn.label || this.label || 'Editor Dinâmico';
        const result = await this.windowService.open(dyn.component, payload, title, event);

        if (ctrl && result !== undefined) {
            const nextVal = dyn.extractResultValue
                ? dyn.extractResultValue(result, ctx)
                : (!isPathLike && result?.value !== undefined && result.value !== currentVal)
                    ? result.value
                    : (isPathLike && result?.filePath && result.filePath !== currentVal)
                        ? result.filePath
                        : undefined;
            if (nextVal !== undefined) {
                ctrl.setValue(nextVal);
                ctrl.markAsDirty();
            }
        }
    }
}
