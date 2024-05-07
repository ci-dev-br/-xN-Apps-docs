import { Injectable, InjectionToken, Type } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

export abstract class DataServiceBase<T> {
    abstract findByText(text: string): Promise<T[]>;
}

export type TypeFormField = 'text' | 'number' | 'option' | 'date' | 'date-time' | 'time' | 'multi-option';

export interface IFormOptions {
    code?: string;
    title?: string;
    description?: string;
    fields?: IFormFieldDefinition<any>[];
}

export interface IFormFieldDefinition<T> {
    label?: string;
    type?: TypeFormField;
    property?: string;
    dataService?: DataServiceBase<T>;
    classTypeRef?: Type<T>;
}

export const FORM_OPTIONS = new InjectionToken<IFormOptions>('PX_FORM_OPTIONS');


@Injectable()
export class FormOptionsBuilder {
    constructor(
        private readonly formBuilder: FormBuilder,
    ) { }
    options(formOptions: IFormOptions): FormGroup {
        let fields: any = {};
        if (formOptions.fields)
            formOptions.fields.forEach(field => {

                if (field.property)
                    fields[field.property] = [, []];
            });
        return this.formBuilder.group(fields);
    }
}