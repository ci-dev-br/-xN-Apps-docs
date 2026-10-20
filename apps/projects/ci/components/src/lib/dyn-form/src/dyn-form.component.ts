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

    // Se estiver editando Application, garante que a propriedade modules esteja disponível para seleção de módulos via chips com autocomplete
    if ((name === 'Application' || name?.toLowerCase() === 'application') && !mergedProperties['modules']) {
      mergedProperties['modules'] = {
        title: 'Módulos Integrados',
        description: 'Lista de módulos ou aplicações padrão contidos e combinados nesta aplicação.',
        type: 'chips-autocomplete' as any,
        format: 'chips-autocomplete',
        enum: [
          'CRM', 'Cadastros', 'Financeiro', 'Vendas', 'Produtos', 'Mensagens',
          'Organizacao', 'Projetos', 'Arquivos', 'Formularios', 'CMS', 'LowCode',
          'Dynamic', 'Treinamento', 'DevTools', 'Codex', 'SEO', 'Threejs', 'Grupos'
        ],
        isArray: true
      };
    }

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

      const propInfo = mergedProperties[p];
      const isChipsAutocomplete =
        propInfo?.format === 'chips-autocomplete' ||
        propInfo?.format === 'modules-autocomplete' ||
        propInfo?.type === 'chips-autocomplete';

      const isModulesField = (p === 'modules' || p === 'modulos' || p === 'containedModules' || isChipsAutocomplete || ((name === 'Application' || this.schemaName === 'Application') && p === 'modules'));
      const sampleVal = this.data?.[p] ?? this.formGroup?.get(p)?.value;
      const inferredType =
        isChipsAutocomplete
          ? 'chips-autocomplete'
          : isModulesField
            ? 'modules'
            : typeof sampleVal === 'number'
              ? 'number'
              : typeof sampleVal === 'boolean'
                ? 'boolean'
                : Array.isArray(sampleVal)
                  ? 'array'
                  : 'text';

      const property_info: ISchemaProperty = propInfo || {
        title: isModulesField ? 'Módulos Integrados' : p,
        type: inferredType,
      };

      const finalType = (isChipsAutocomplete || property_info.format === 'chips-autocomplete' || isModulesField)
        ? 'chips-autocomplete'
        : (property_info.type || inferredType);

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
        const initialVal = this.data?.[p] ?? (isModulesField || isChipsAutocomplete ? [] : null);
        const ctrl = new FormControl(initialVal);
        ctrl.valueChanges.subscribe(val => {
          if (this.data && typeof this.data === 'object') {
            this.data[p] = val;
          }
        });
        this.formGroup.addControl(p, ctrl);
      }

      fields.push({
        label: property_info.title || (isModulesField ? 'Módulos Integrados' : p),
        property: p,
        description: property_info.description || (isModulesField ? 'Selecione os módulos e aplicações padrão contidos e combinados nesta aplicação.' : undefined),
        type: finalType as any,
        format: property_info.format,
        enum: property_info.enum,
        items: property_info.items,
        schemaName: schema_name,
        readonly: property_info.readOnly,
        dataService: schema_name ? (getServiceAsSchema(schema_name) as any) : undefined,
        isArray: property_info.type === 'array' || property_info.isArray || isModulesField || isChipsAutocomplete,
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
