import { Component, Inject, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { FORM_OPTIONS, IFormFieldDefinition, IFormOptions } from './i-form-options';
import { FormControl, FormGroup } from '@angular/forms';
import { DaoBuilder, ISchemaProperty } from '@ci/core';
import { getServiceAsSchema } from '@ci/portal-api';
import { MatChipInputEvent } from '@angular/material/chips';

const HIDDEN_AUDIT_FIELDS = [
  'internalId',
  'id',
  'createdAt',
  'createdBy',
  'lastModifiedAt',
  'lastModifiedBy',
  'tenants',
  'deleted',
  'snapshots',
];

@Component({
  selector: 'ci-dyn-form',
  standalone: false,
  templateUrl: './dyn-form.component.html',
  styleUrls: ['./dyn-form.component.scss']
})
export class DynFormComponent implements OnInit, OnChanges {
  @Input()
  formGroup?: FormGroup;
  @Input()
  schemaName?: string;
  @Input()
  source?: IFormOptions;
  @Input()
  data?: any;
  @Input()
  schemaProperties?: { [key: string]: ISchemaProperty };

  private hasInjectedOptions = false;

  constructor(
    @Optional() private readonly daoBuilder?: DaoBuilder,
    @Optional() @Inject(FORM_OPTIONS)
    formOptions?: IFormOptions,
  ) {
    if (formOptions) {
      this.source = formOptions;
      this.hasInjectedOptions = true;
    }
  }

  async ngOnInit() {
    if (!this.hasInjectedOptions) {
      await this.rebuildFormOptions();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (
      !this.hasInjectedOptions &&
      (changes['schemaName'] || changes['formGroup'] || changes['data'] || changes['schemaProperties'])
    ) {
      await this.rebuildFormOptions();
    }
  }

  private async rebuildFormOptions() {
    this.source = await this.getFormOptionsBySchema(this.schemaName || '');
  }

  private isInternalOrAuditKey(key: string): boolean {
    return (
      !key ||
      HIDDEN_AUDIT_FIELDS.includes(key) ||
      key.startsWith('_') ||
      key.startsWith(':') ||
      key === 'toJSON' ||
      key === 'toString' ||
      key === '__constructor__'
    );
  }

  async getFormOptionsBySchema(name: string): Promise<IFormOptions> {
    const schemaFromBuilder = (name && this.daoBuilder) ? await this.daoBuilder.getSchema(name) : undefined;
    const schemaProps = schemaFromBuilder?.properties || {};

    const mergedProperties: { [key: string]: ISchemaProperty } = {
      ...(this.schemaProperties || {}),
      ...schemaProps,
    };

    // Fallback: incorpora chaves existentes no objeto `data` ou no `formGroup` caso o schema esteja vazio ou incompleto
    const candidateKeys = new Set<string>(Object.keys(mergedProperties));
    if (this.data && typeof this.data === 'object') {
      Object.keys(this.data).forEach(k => candidateKeys.add(k));
    }
    if (this.formGroup?.controls) {
      Object.keys(this.formGroup.controls).forEach(k => candidateKeys.add(k));
    }

    const fields: IFormFieldDefinition<any>[] = [];

    for (const p of candidateKeys) {
      if (this.isInternalOrAuditKey(p)) continue;

      const sampleVal = this.data?.[p] ?? this.formGroup?.get(p)?.value;
      const inferredType =
        typeof sampleVal === 'number'
          ? 'number'
          : typeof sampleVal === 'boolean'
            ? 'boolean'
            : Array.isArray(sampleVal)
              ? 'array'
              : 'text';

      const property_info: ISchemaProperty = mergedProperties[p] || {
        title: p,
        type: inferredType,
      };

      const schema_name =
        !!(property_info as any).items && (property_info as any).items['$ref']
          ? (property_info as any).items['$ref'].replace('#/components/schemas/', '')
          : !!(property_info as any).allOf &&
            !!(property_info as any).allOf[0] &&
            !!(property_info as any).allOf[0]['$ref']
            ? (property_info as any).allOf[0]['$ref'].replace('#/components/schemas/', '')
            : (property_info as any).$ref
              ? (property_info as any).$ref.replace('#/components/schemas/', '')
              : undefined;

      if (this.formGroup && !this.formGroup.get(p)) {
        const ctrl = new FormControl(this.data?.[p] ?? null);
        ctrl.valueChanges.subscribe(val => {
          if (this.data && typeof this.data === 'object') {
            this.data[p] = val;
          }
        });
        this.formGroup.addControl(p, ctrl);
      }

      fields.push({
        label: property_info.title || p,
        property: p,
        description: property_info.description,
        type: property_info.type || inferredType,
        items: property_info.items,
        schemaName: schema_name,
        readonly: property_info.readOnly,
        dataService: schema_name ? (getServiceAsSchema(schema_name) as any) : undefined,
        isArray: property_info.type === 'array' || property_info.isArray,
      } as IFormFieldDefinition<any>);
    }

    return {
      title: name,
      fields,
    };
  }

  removeOption(option: string, list: string[]) {
    const pos = list.indexOf(option);
    if (pos > -1) {
      list.splice(pos, 1);
    }
  }
  add(prop: string, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && value.length > 0) {
      if (!this.formGroup?.controls[prop]?.value) this.formGroup?.controls[prop]?.setValue([]);
      this.formGroup?.controls[prop]?.value.push(value);
    }
    event.chipInput.inputElement.value = '';
  }
}
