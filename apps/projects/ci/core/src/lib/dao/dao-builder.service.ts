import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ApiConfiguration } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
/**
 * Aguardar verdadeiro
 * @param condition 
 * @returns 
 */
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
 * # Interface de Schema Property Item
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
    $ref?: string;
    enum?: any[];
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
@Injectable({
    providedIn: 'root'
})
export class DaoBuilder /* Service */ {
    api_json = new BehaviorSubject<any>(undefined);
    private loadingPromise?: Promise<any>;
    constructor(
        private readonly http: HttpClient,
        private readonly apiConfig: ApiConfiguration,
        private readonly formBuilder: FormBuilder,
    ) {
        this.loadApiJson();
    }
    async loadApiJson() {
        if (this.api_json.value) return this.api_json.value;
        if (this.loadingPromise) return this.loadingPromise;
        this.loadingPromise = lastValueFrom(
            this.http.get(this.apiConfig.rootUrl + '/api-json')
        ).then(res => {
            this.api_json.next(res);
            return res;
        }).catch(err => {
            console.warn('Falha ao carregar /api-json em DaoBuilder:', err);
            this.loadingPromise = undefined;
            return undefined;
        });
        return this.loadingPromise;
    }
    async getForm(name: string, fallbackData?: any, extraProperties?: { [key: string]: ISchemaProperty }) {
        const schema: ISchema = (await this.getSchema(name));
        const fields: any = {};
        const mergedProps = {
            ...(extraProperties || {}),
            ...(schema?.properties || {}),
        };
        Object.keys(mergedProps).forEach(key => {
            fields[key] = [fallbackData?.[key] ?? null, []];
        });
        if (fallbackData && typeof fallbackData === 'object') {
            Object.keys(fallbackData).forEach(key => {
                if (
                    !key.startsWith('_') &&
                    !key.startsWith(':') &&
                    key !== 'toJSON' &&
                    key !== 'toString' &&
                    !(key in fields)
                ) {
                    fields[key] = [fallbackData[key], []];
                }
            });
        }
        return this.formBuilder.group({
            ...fields
        });
    }
    async getSchema(name: string): Promise<ISchema> {
        if (!this.api_json.value) {
            await this.loadApiJson();
        }
        const schemas = this.api_json.value?.components?.schemas || {};
        let schema: ISchema = schemas[name];
        if (!schema && name) {
            const foundKey = Object.keys(schemas).find(k => k.toLowerCase() === name.toLowerCase());
            if (foundKey) schema = schemas[foundKey];
        }
        return schema || { type: 'object', properties: {} };
    }

    async listSchemas() {
        if (!this.api_json.value) {
            await this.loadApiJson();
        }
        return Object.keys(this.api_json.value?.components?.schemas || {});
    }
}