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
export interface ISchemaProperty {
    title?: string;
    description?: string;
    format?: string;
    type?: string;
    nullable?: boolean;
    isArray?: boolean;
    uniqueItems?: boolean;
    allOf?: { [key: string]: string };
    /* {
        '$ref'?: string
    }; */
    items?: { [key: string]: string };
}
export interface ISchema {
    type?: string;
    properties?: { [key: string]: ISchemaProperty };
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