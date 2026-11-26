import { Injectable, InjectionToken, Type } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { IDynamicSchemaType, ISchemaProperty } from "@ci/core";

export abstract class DataServiceBase<T> {
    abstract findByText(text: string): Promise<T[]>;
}

export type TypeFormField =
    | 'text'
    | 'textarea'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'checkbox'
    | 'option'
    | 'date'
    | 'date-time'
    | 'time'
    | 'multi-option'
    | 'modules'
    | 'app-modules'
    | 'chips-autocomplete'
    | 'chips'
    | 'email'
    | 'url'
    | 'password'
    | 'color'
    | 'json'
    | 'object'
    | 'dynamic'
    | 'ts'
    | 'typescript'
    | 'code'
    | (string & {});

export interface IFormOptions {
    code?: string;
    title?: string;
    description?: string;
    fields?: IFormFieldDefinition<any>[];
}

/**
 * # Form Field Definition
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
    format?: string;
    enum?: any[];
    schemaName?: string;
    schemaProperty?: ISchemaProperty;
    dynamicType?: IDynamicSchemaType;
    nullable?: boolean;
    placeholder?: string;
    value?: any;
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
    /**
     * Serviço do objeto
     */
    service?: Type<any>;
    /**
     * Items type
     */
    items?: { [key: string]: string };
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
