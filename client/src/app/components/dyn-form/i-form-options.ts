
export interface IFormOptions {
    title?: string;
    description?: string;
    fields: IFormFieldDefinition[];
}

export interface IFormFieldDefinition {
    label?: string;
    type?: string;
}