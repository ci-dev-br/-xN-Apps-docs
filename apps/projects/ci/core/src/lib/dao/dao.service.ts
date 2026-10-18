import { EventEmitter, Injectable, Optional, SimpleChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BehaviorSubject, lastValueFrom, of, Subject } from "rxjs";
import { IChangeable, OfString } from "./models";
import { EMITTER } from "../emitter/token";
import { HttpClient } from "@angular/common/http";
import { ApiConfiguration } from "@ci/portal-api";
import { WsService } from "../io/ws.service";
import { ISchema } from "./dao-builder.service";
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
 *   Mapeamento de entidade
 *   Objeto com meta informação para realizar o mapeamento do objeto
 */
@Injectable({
    providedIn: 'root'
})
export class DaoService {
    private loadingPromise?: Promise<any>;
    constructor(
        private readonly apiConfig: ApiConfiguration,
        private readonly http: HttpClient,
        @Optional() private readonly ws?: WsService,
    ) {
        this.loadApiJson();
    }
    private states = new Map<any, any>();
    api_json = new BehaviorSubject<any>(undefined);
    async loadApiJson() {
        if (this.api_json.value) return this.api_json.value;
        if (this.loadingPromise) return this.loadingPromise;
        this.loadingPromise = lastValueFrom(
            this.http.get(this.apiConfig.rootUrl + '/api-json')
        ).then(res => {
            this.api_json.next(res);
            return res;
        }).catch(err => {
            console.warn('Falha ao carregar /api-json em DaoService:', err);
            this.loadingPromise = undefined;
            return undefined;
        });
        return this.loadingPromise;
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
    /**
     * Prepara o objeto para ser editado por ReactiveFormsModule ou FormsModule Strategies.
     * 
     */
    async prepareToEdit(data: any, options?: {
        fieldsId?: string[],
        onChange?: (changes: SimpleChanges) => void,
        debounceTime?: number,
        /**
         * Optional schema data binding
         */
        schemaName?: string,
    }): /* SerializedObjectData */  Promise<IChangeable[] | IChangeable | Date | undefined> {
        if ('__name' in data) {
            // this.
            const schema = await this.getSchema(data.__name);
            schema;
            options;
            data['::initial_pepare_snapshot::'] = [
                { ...{ ...data } }
            ];
        }
        return of().toPromise();
    }
    getChanges(data?: IChangeable, options?: {
        pre: any
    }) {
        if (!data) return undefined;
        const r: any = {};
        const pre = options?.pre || ((data as any)['::initial_pepare_snapshot::'] || [])[0];
        try {
            Object.getOwnPropertyNames(data).forEach(p => {
                if (p.indexOf('_') === 0 || p.indexOf(':') === 0) return;
                // TODO:  identificar mudança em relação ao pre
                if (p === 'internalId' || !pre || (!!pre && JSON.stringify((data as any)[p]) !== JSON.stringify(pre[p]))) {
                    r[p] = (data as any)[p];
                } else {
                    // TODO: não sei se deveria faze algo aqui...
                }
            })
        } catch (error) {
            console.trace(error);
        }
        return r;
    }
    async read(data: any, schemaName?: string) {
        if (data instanceof Date) return data;
        if (Array.isArray(data)) {
            data.forEach(o => this.read(o, schemaName));
        } else if (!!data && typeof data === 'object') {
            if (!!data.__readed) return data;
            data.__readed = true;
            if (Object.getOwnPropertyDescriptor(data, 'toJSON') === undefined) {
                Object.defineProperty(data, 'toJSON', {
                    value: () => {
                        try {
                            if (!!data && '__confirmation_subject' in data) {
                                try {
                                    const { __confirmation_subject, ...out } = JSON.parse(JSON.stringify(data));
                                    return out
                                } catch (error) {
                                    try {
                                        const { __confirmation_subject, ...out } = data;
                                        return out
                                    } catch (error) {
                                        console.trace(error)
                                    }
                                }
                            } else {
                                const out: any = {
                                    ...this.getChanges(data/* , { pre } */)
                                };
                                (['id', 'internalId']).forEach(p => {
                                    if (data[p]) {
                                        out[p] = data[p] || undefined;
                                    }
                                })
                                return out;
                            }
                        } catch (error) {
                            console.trace(error);
                        }
                    }
                });
            }
            try {
                Object.keys(data).forEach(p => {
                    try {
                        this.read(data[p]);
                    } catch (error) {
                        console.trace(error);
                    }
                })
            } catch (error) {
                console.trace(error);
            }
            // if (!data.toString)
            try {
                Object.defineProperty(data, 'toString', {
                    value: () => {
                        return OfString(data);
                    }
                });
            } catch (error) {
                console.trace(error);
            }
        }
        return data;
    }
    haveChanges(data?: IChangeable | any) {
        return Object.keys(this.getChanges(data)).length > 0;
    }
    bindDataForm(data: any, form: FormGroup, oldData?: IChangeable) {
        try {
            if (data && form) {
                form.reset(data);
                Object.keys(form.controls).forEach((v) => {
                    form.get(v)?.valueChanges.subscribe(changedValue => {
                        try {
                            // Atualiza propriedade do objeto conectado ao formulário
                            (data as any)[v] = changedValue;
                        } catch (error) {
                            console.trace(error)
                        }
                    });
                })
                //  data.__binding_form = form; ? para que serve esta linha? Faz efeito remove-la?
                // Ela vem de uma estrutura legada que não foi adaptada. Aparentemente pode sim ser removida sem provocar reflexo
                if (!!data && !!data[EMITTER]) (data[EMITTER] as EventEmitter<SimpleChanges>)
                    .subscribe(changes => {
                        Object.keys(changes).forEach(Property => {
                            if (changes[Property].currentValue !== form.controls[Property].value &&
                                changes[Property].previousValue === form.controls[Property].value
                            )
                                form.controls[Property].setValue(changes[Property].currentValue);
                        })
                    })
            }
        } catch (error) {
            console.trace(error);
        }
    }
    async confirmChanges(data: any,) {
        try {
            if (!!data && typeof data === 'object' && '__confirmation_subject' in data && data?.__confirmation_subject instanceof Subject) {
                const changes = this.getChanges(data);
                changes;
                /* (data.__confirmation_subject as Subject<any>).next({
                    at: new Date(),
                    what: this.ObjectIdentification(data),
                }); */
                (data.__confirmation_subject as Subject<any>).next(changes);
            }
            /// TODO: remover assinatura de evento Attention para Objeto quando for abandonado pelo componente.
            this.ws?.Propagar(data);
        } catch (error) {
            console.log(data)
        }
    }

    ObjectIdentification(object_synchronizable: any) {
        return object_synchronizable.id || object_synchronizable.internalId;
    }

    confirmation<T>(data: T) {
        // try {
        if (!data) return undefined;
        if (typeof data === 'object' && !(data as any).__confirmation_subject) {
            (data as any).__confirmation_subject = new Subject();
        }
        return (data as any).__confirmation_subject as Subject<T>;
        // } catch (error) {
        //     console.trace(error);
        // }
    }
}