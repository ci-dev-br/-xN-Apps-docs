import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FORM_OPTIONS, IFormFieldDefinition, IFormOptions } from './i-form-options';
import { FormGroup } from '@angular/forms';
import { DaoBuilder } from '@ci/core';

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
              return {
                label: properties[p].title || p,
                property: p,
                type: properties[p].type,
              } as IFormFieldDefinition<any>
            })
          ]
        } as IFormOptions;
        return options;
      }
    }
    return await undefined as any;
  }
}
