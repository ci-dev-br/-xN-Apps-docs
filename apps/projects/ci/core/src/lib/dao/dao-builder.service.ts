import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ApiConfiguration } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";

async function waitTrue(condition: () => boolean) {
    return new Promise<void>((res, rej) => {
        const repeat = () => {
            setTimeout(async () => {
                if (condition()) {
                    res();
                } else {
                    repeat();
                }
            }, 5);
        }
        if (condition()) {
            res();
        } else {
            repeat();
        }
    })
}
/**
 * 
 */
export interface ISchemaProperty {
    /**
     * Title of Property schema
     */
    title?: string;
    /**
     * Description of field
     */
    description?: string;
    /**
     * Format of data
     */
    format?: string;
    /**
     * Type of data 
     */
    type?: string;
    /**
     * Nullable not permit instancialize new object with not information
     */
    nullable?: boolean;
    /**
     * Define this field with only for read. 
     */
    readOnly?: boolean;
    /**
     * Define the property with Array
     */
    isArray?: boolean;
    /**
     * This field is Unique
     */
    uniqueItems?: boolean;
    /**
     * 
     */
    allOf?: { [key: string]: string };
    /**
     * 
     */
    items?: { [key: string]: string };
    /* {
        '$ref'?: string
    }; */
}
export interface ISchema {
    /**
     * Type of Schema Information
     */
    type?: string;
    /**
     * Porperties informations
     */
    properties?: { [key: string]: ISchemaProperty };
    /**
     * Required fields to creation
     */
    required?: string[];
}
@Injectable()
export class DaoBuilder /* Service */ {
    api_json = new BehaviorSubject<any>(undefined);
    constructor(
        private readonly http: HttpClient,
        private readonly apiConfig: ApiConfiguration,
        private readonly formBuilder: FormBuilder,
    ) {
        this.loadApiJson();
    }
    async loadApiJson() {
        this.api_json.next(await lastValueFrom(
            this.http.get(this.apiConfig.rootUrl + '/api-json')
        ));
    }
    async getForm(name: string) {
        const schema: ISchema = await this.getSchema(name);
        const fields: any = {}
        if (schema.properties) {
            Object.keys(schema.properties).map(key => {
                fields[key] = [, []];
            });
        }
        return this.formBuilder.group({
            ...fields
        });
    }
    async getSchema(name: string) {
        await waitTrue(() => !!this.api_json.value)
        const schema: ISchema = this.api_json.value.components.schemas[name];
        return schema;
    }
}