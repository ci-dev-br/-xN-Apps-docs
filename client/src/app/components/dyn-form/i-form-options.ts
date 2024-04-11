import { InjectionToken } from "@angular/core";


export class DataService { }

export type TypeFormField = 'text' | 'number' | 'option' | 'date' | 'date-time' | 'time' | 'multi-option';

export interface IFormOptions {
    code?: string;
    title?: string;
    description?: string;
    fields?: IFormFieldDefinition[];
}

export interface IFormFieldDefinition {
    label?: string;
    type?: TypeFormField;
    property?: string;
    dataService?: DataService;
}

export const FORM_OPTIONS = new InjectionToken<IFormOptions[]>('PX_FORM_OPTIONS');