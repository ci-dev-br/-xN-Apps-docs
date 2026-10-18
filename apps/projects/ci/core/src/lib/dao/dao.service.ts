import { EventEmitter, Injectable, Optional, SimpleChanges } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, lastValueFrom, Observable, Subject, Subscription } from "rxjs";
import { IChangeable, OfString } from "./models";
import { EMITTER } from "../emitter/token";
import { HttpClient } from "@angular/common/http";
import { ApiConfiguration } from "@ci/portal-api";
import { WsService } from "../io/ws.service";
import { ISchema } from "./dao-builder.service";

const SNAPSHOT_KEY = '::initial_pepare_snapshot::';
const CONFIRMATION_KEY = '__confirmation_subject';
const READED_KEY = '__readed';

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
    private static loadingPromise?: Promise<any>;
    private static snapshots = new WeakMap<object, any>();
    private static confirmationSubjects = new WeakMap<object, Subject<any>>();
    private static formSubscriptions = new WeakMap<FormGroup, Subscription[]>();
    private static sharedApiJson = new BehaviorSubject<any>(undefined);

    constructor(
        private readonly apiConfig: ApiConfiguration,
        private readonly http: HttpClient,
        @Optional() private readonly ws?: WsService,
    ) {
        this.loadApiJson();
    }
    private states = new Map<any, any>();
    get api_json(): BehaviorSubject<any> {
        return DaoService.sharedApiJson;
    }

    /**
     * Verifica se uma chave é metadado interno de controle e não deve ser serializada/comparada.
     */
    private isInternalKey(key: string): boolean {
        return (
            !key ||
            key.startsWith('_') ||
            key.startsWith(':') ||
            key === 'toJSON' ||
            key === 'toString' ||
            key === '__constructor__'
        );
    }

    /**
     * Verifica se um valor é uma estrutura reativa/interna (RxJS Subject, Observable, FormGroup, EventEmitter)
     * que pode conter referências cíclicas e não deve ser clonada ou serializada.
     */
    private isReactiveOrInternalObject(val: any): boolean {
        if (!val || typeof val !== 'object') return false;
        return (
            val instanceof Subject ||
            val instanceof Observable ||
            val instanceof EventEmitter ||
            val instanceof AbstractControl ||
            typeof val.subscribe === 'function'
        );
    }

    /**
     * Define uma propriedade oculta (não enumerável) no objeto alvo para evitar ciclos em `JSON.stringify` e `{ ...obj }`.
     */
    private defineHiddenProperty(target: any, key: string, value: any) {
        if (!target || typeof target !== 'object') return;
        try {
            Object.defineProperty(target, key, {
                value,
                enumerable: false,
                configurable: true,
                writable: true,
            });
        } catch {
            // Caso o objeto esteja congelado (Object.isFrozen)
        }
    }

    /**
     * Cria uma cópia profunda limpa e segura contra referências cíclicas,
     * ignorando propriedades internas (`_`, `:`) e objetos reativos (`Subject`, `FormGroup`, etc.).
     */
    public sanitizeDeep<T = any>(value: T, visited = new WeakMap<object, any>()): T {
        if (value === null || value === undefined || typeof value !== 'object') {
            return value;
        }
        if (value instanceof Date) {
            return new Date(value.getTime()) as any;
        }
        if (value instanceof RegExp) {
            return new RegExp(value.source, value.flags) as any;
        }
        if (this.isReactiveOrInternalObject(value)) {
            return undefined as any;
        }
        if (visited.has(value as object)) {
            return visited.get(value as object);
        }
        if (Array.isArray(value)) {
            const arrCopy: any[] = [];
            visited.set(value as object, arrCopy);
            for (const item of value) {
                if (!this.isReactiveOrInternalObject(item)) {
                    arrCopy.push(this.sanitizeDeep(item, visited));
                }
            }
            return arrCopy as any;
        }
        const objCopy: Record<string, any> = {};
        visited.set(value as object, objCopy);
        for (const key of Object.keys(value as object)) {
            if (this.isInternalKey(key)) continue;
            const propVal = (value as any)[key];
            if (typeof propVal === 'function' || this.isReactiveOrInternalObject(propVal)) continue;
            objCopy[key] = this.sanitizeDeep(propVal, visited);
        }
        return objCopy as T;
    }

    /**
     * Serializa um valor para string JSON de forma segura contra referências cíclicas.
     */
    private safeStringify(value: any): string {
        const seen = new WeakSet<object>();
        try {
            return JSON.stringify(value, (key, val) => {
                if (key && this.isInternalKey(key)) return undefined;
                if (val && typeof val === 'object') {
                    if (this.isReactiveOrInternalObject(val)) return undefined;
                    if (seen.has(val)) return undefined;
                    seen.add(val);
                }
                return val;
            });
        } catch {
            return '';
        }
    }

    async loadApiJson() {
        if (DaoService.sharedApiJson.value) return DaoService.sharedApiJson.value;
        if (DaoService.loadingPromise) return DaoService.loadingPromise;
        DaoService.loadingPromise = lastValueFrom(
            this.http.get(this.apiConfig.rootUrl + '/api-json')
        ).then(res => {
            DaoService.sharedApiJson.next(res);
            return res;
        }).catch(err => {
            console.warn('Falha ao carregar /api-json em DaoService:', err);
            DaoService.loadingPromise = undefined;
            return undefined;
        });
        return DaoService.loadingPromise;
    }
    async getSchema(name: string): Promise<ISchema> {
        if (!DaoService.sharedApiJson.value) {
            await this.loadApiJson();
        }
        const schemas = DaoService.sharedApiJson.value?.components?.schemas || {};
        let schema: ISchema = schemas[name];
        if (!schema && name) {
            const foundKey = Object.keys(schemas).find(k => k.toLowerCase() === name.toLowerCase());
            if (foundKey) schema = schemas[foundKey];
        }
        return schema || { type: 'object', properties: {} };
    }
    /**
     * Prepara o objeto para ser editado por ReactiveFormsModule ou FormsModule Strategies.
     * Captura imediatamente um snapshot profundo livre de referências cíclicas e metadados internos.
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
        if (!data || typeof data !== 'object') return undefined;

        if (CONFIRMATION_KEY in data) {
            const existingSubject = data[CONFIRMATION_KEY];
            if (existingSubject instanceof Subject) {
                DaoService.confirmationSubjects.set(data, existingSubject);
            }
            this.defineHiddenProperty(data, CONFIRMATION_KEY, existingSubject);
        }

        // Captura o snapshot profundo de forma síncrona antes de qualquer await para evitar condição de corrida
        const cleanSnapshot = this.sanitizeDeep(data);
        DaoService.snapshots.set(data, cleanSnapshot);
        this.defineHiddenProperty(data, SNAPSHOT_KEY, [cleanSnapshot]);

        const schemaName = options?.schemaName || data.__name;
        if (schemaName) {
            this.defineHiddenProperty(data, '__name', schemaName);
        }
        return data;
    }
    getChanges(data?: IChangeable, options?: {
        pre: any
    }) {
        if (!data || typeof data !== 'object') return undefined;
        const r: any = {};
        const pre =
            options?.pre ||
            DaoService.snapshots.get(data as object) ||
            ((data as any)[SNAPSHOT_KEY] || [])[0] ||
            (data as any).__pre;
        try {
            Object.getOwnPropertyNames(data).forEach(p => {
                if (this.isInternalKey(p)) return;
                const currentVal = (data as any)[p];
                if (typeof currentVal === 'function' || this.isReactiveOrInternalObject(currentVal)) return;

                if (
                    p === 'internalId' ||
                    p === 'id' ||
                    !pre ||
                    this.safeStringify(currentVal) !== this.safeStringify(pre[p])
                ) {
                    r[p] = this.sanitizeDeep(currentVal);
                }
            });
            if ((data as any).internalId && !r.internalId) {
                r.internalId = (data as any).internalId;
            }
            if ((data as any).id && !r.id) {
                r.id = (data as any).id;
            }
        } catch (error) {
            console.trace(error);
        }
        return r;
    }
    async read(data: any, schemaName?: string, visited = new WeakSet<object>()) {
        if (!data || typeof data !== 'object') return data;
        if (data instanceof Date || this.isReactiveOrInternalObject(data)) return data;
        if (visited.has(data)) return data;
        visited.add(data);

        if (Array.isArray(data)) {
            data.forEach(o => this.read(o, schemaName, visited));
        } else {
            if (!!data[READED_KEY]) return data;
            this.defineHiddenProperty(data, READED_KEY, true);
            if (Object.getOwnPropertyDescriptor(data, 'toJSON') === undefined) {
                Object.defineProperty(data, 'toJSON', {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: () => {
                        try {
                            if (DaoService.confirmationSubjects.has(data) || CONFIRMATION_KEY in data) {
                                return this.sanitizeDeep(data);
                            } else {
                                const out: any = {
                                    ...this.getChanges(data)
                                };
                                (['id', 'internalId']).forEach(p => {
                                    if (data[p]) {
                                        out[p] = data[p] || undefined;
                                    }
                                });
                                return out;
                            }
                        } catch (error) {
                            console.trace(error);
                            return this.sanitizeDeep(data);
                        }
                    }
                });
            }
            try {
                Object.keys(data).forEach(p => {
                    if (this.isInternalKey(p)) return;
                    const child = data[p];
                    if (child && typeof child === 'object' && !this.isReactiveOrInternalObject(child)) {
                        try {
                            this.read(child, undefined, visited);
                        } catch (error) {
                            console.trace(error);
                        }
                    }
                });
            } catch (error) {
                console.trace(error);
            }
            try {
                Object.defineProperty(data, 'toString', {
                    enumerable: false,
                    configurable: true,
                    writable: true,
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
        return Object.keys(this.getChanges(data) || {}).length > 0;
    }
    bindDataForm(data: any, form: FormGroup, oldData?: IChangeable) {
        try {
            if (data && form) {
                // Limpa inscrições anteriores deste FormGroup para evitar múltiplos listeners acumulados e vazamento de memória
                const prevSubs = DaoService.formSubscriptions.get(form);
                if (prevSubs?.length) {
                    prevSubs.forEach(s => s.unsubscribe());
                }
                const newSubs: Subscription[] = [];

                form.reset(this.sanitizeDeep(data));
                Object.keys(form.controls).forEach((v) => {
                    const sub = form.get(v)?.valueChanges.subscribe(changedValue => {
                        try {
                            // Atualiza propriedade do objeto conectado ao formulário
                            (data as any)[v] = changedValue;
                        } catch (error) {
                            console.trace(error);
                        }
                    });
                    if (sub) newSubs.push(sub);
                });

                // Também escuta valueChanges no nível do FormGroup para capturar controles adicionados dinamicamente (ex: DynFormComponent)
                const groupSub = form.valueChanges.subscribe(formValues => {
                    try {
                        if (formValues && typeof formValues === 'object') {
                            Object.keys(formValues).forEach(k => {
                                if (!this.isInternalKey(k) && formValues[k] !== undefined) {
                                    (data as any)[k] = formValues[k];
                                }
                            });
                        }
                    } catch (error) {
                        console.trace(error);
                    }
                });
                newSubs.push(groupSub);

                if (!!data && !!data[EMITTER]) {
                    const emitterSub = (data[EMITTER] as EventEmitter<SimpleChanges>)
                        .subscribe(changes => {
                            Object.keys(changes).forEach(Property => {
                                if (
                                    form.controls[Property] &&
                                    changes[Property].currentValue !== form.controls[Property].value &&
                                    changes[Property].previousValue === form.controls[Property].value
                                ) {
                                    form.controls[Property].setValue(changes[Property].currentValue);
                                }
                            });
                        });
                    newSubs.push(emitterSub);
                }
                DaoService.formSubscriptions.set(form, newSubs);
            }
        } catch (error) {
            console.trace(error);
        }
    }
    async confirmChanges(data: any) {
        try {
            if (!!data && typeof data === 'object') {
                const subject =
                    DaoService.confirmationSubjects.get(data) ||
                    (data[CONFIRMATION_KEY] instanceof Subject ? data[CONFIRMATION_KEY] : undefined);
                if (subject instanceof Subject) {
                    const changes = this.getChanges(data);
                    subject.next(changes);
                }
            }
            /// TODO: remover assinatura de evento Attention para Objeto quando for abandonado pelo componente.
            this.ws?.Propagar(this.sanitizeDeep(data));
        } catch (error) {
            console.log(data);
        }
    }

    ObjectIdentification(object_synchronizable: any) {
        return object_synchronizable?.id || object_synchronizable?.internalId;
    }

    confirmation<T>(data: T) {
        if (!data || typeof data !== 'object') return undefined;
        let subject = DaoService.confirmationSubjects.get(data as object);
        if (!subject) {
            const existing = (data as any)[CONFIRMATION_KEY];
            subject = existing instanceof Subject ? existing : new Subject<T>();
            DaoService.confirmationSubjects.set(data as object, subject);
        }
        this.defineHiddenProperty(data, CONFIRMATION_KEY, subject);
        return subject as Subject<T>;
    }
}