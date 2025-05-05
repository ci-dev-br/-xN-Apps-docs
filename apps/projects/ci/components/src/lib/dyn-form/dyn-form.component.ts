import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FORM_OPTIONS, IFormFieldDefinition, IFormOptions } from './i-form-options';
import { FormGroup } from '@angular/forms';
import { DaoBuilder } from '@ci/core';
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
      const properties = await (await this.daoBuilder.getSchema(name)).properties
      if (properties) {
        const options = {
          title: name,
          fields: [
            ...Object.keys(properties).map(p => {
              const property_info = properties[p];
              return {
                label: property_info.title || p,
                property: p,
                type: property_info.type,
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
