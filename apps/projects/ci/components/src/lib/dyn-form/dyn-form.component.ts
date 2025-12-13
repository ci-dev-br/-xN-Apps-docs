import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FORM_OPTIONS, IFormFieldDefinition, IFormOptions } from './i-form-options';
import { FormGroup } from '@angular/forms';
import { DaoBuilder } from '@ci/core';
import { getServiceAsSchema } from '@ci/portal-api';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'ci-dyn-form',
  standalone: false,
  templateUrl: './dyn-form.component.html',
  styleUrls: ['./dyn-form.component.scss']
})
export class DynFormComponent implements OnInit {
  @Input()
  formGroup?: FormGroup;
  @Input()
  schemaName?: string;
  @Input()
  source?: IFormOptions;
  constructor(
    @Optional() private readonly daoBuilder?: DaoBuilder,
    @Optional() @Inject(FORM_OPTIONS)
    formOptions?: IFormOptions,
  ) {
    if (formOptions) this.source = formOptions;
  }
  async ngOnInit() {
    if (this.daoBuilder && !this.source && this.schemaName) this.source = await this.getFormOptionsBySchema(this.schemaName)
  }
  async getFormOptionsBySchema(name: string): Promise<IFormOptions> {
    if (this.daoBuilder) {
      const hidden_fields = ['internalId', 'createdAt', 'createdBy', 'lastModifiedAt', 'lastModifiedBy', 'deleted', 'tenants'];
      const properties = await (await this.daoBuilder.getSchema(name)).properties
      if (properties) {
        const options = {
          title: name,
          fields: [
            ...Object.keys(properties)
              .filter(col => hidden_fields.indexOf(col) === -1)
              .map(p => {
                const property_info = properties[p];
                const schema_name = !!(property_info as any).items && (property_info as any).items['$ref'] ? (property_info as any).items['$ref'].replace('#/components/schemas/', '') : !!(property_info as any).allOf && !!(property_info as any).allOf[0] && !!(property_info as any).allOf[0]['$ref'] ? (property_info as any).allOf[0]['$ref'].replace('#/components/schemas/', '') : undefined;
                return {
                  label: property_info.title || p,
                  property: p,
                  description: property_info.description,
                  type: property_info.type,
                  items: property_info.items,
                  schemaName: schema_name,
                  readonly: property_info.readOnly,
                  dataService: schema_name ? getServiceAsSchema(schema_name) as any : undefined,
                  isArray: property_info.type === 'array' || property_info.isArray
                } as IFormFieldDefinition<any>
              })
          ]
        } as IFormOptions;
        return options;
      }
    }
    return await undefined as any;
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
      if (!this.formGroup?.controls[prop].value) this.formGroup?.controls[prop].setValue([]);
      this.formGroup?.controls[prop].value.push(value);
    }
    event.chipInput.inputElement.value = '';
  }
}
