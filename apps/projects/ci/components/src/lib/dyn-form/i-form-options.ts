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

/**
 * # Forn Field Definition 
 * 
 */
export interface IFormFieldDefinition<T> {
    /**
     * Full name of propertie
     */
    label?: string;
    /**
     * Type represent a abtraction with manipulate, validate, store and apresentation of Classes or primitives data
     */
    type?: TypeFormField;
    /**
     * Property name of Object to connect field with propertie view and edit data
     */
    property?: string;
    /**
     * Descriptopn of field input
     */
    description?: string;
    /**
     * Service of Manipulate data for edit or view informations
     */
    dataService?: DataServiceBase<T>;
    /**
     * Class type of data propertie for create and restore meta-data
     */
    classTypeRef?: Type<T>;
    /**
     * Define if is Array 
     */
    isArray?: boolean;
    /**
     * Define if property is only for read
     */
    readonly: boolean;
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