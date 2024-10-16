import { EventEmitter, Injectable, SimpleChange, SimpleChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { WsService } from "../core.module";
import { EMITTER } from "../emitter/token";

/**
 * Objeto alterável pela interface do usuário
 */
export interface IChangeable {
    /***
     * Snapshot do objeto antes de iniciar as mudanças no objeto.
     */
    __pre: any;
    /**
     * Metadados do formulário conectado ao Objeto
     */
    __binding_form?: FormGroup;
}
export class SerializedObjectData implements IChangeable {
    __pre: any;
    __binding_form?: FormGroup;
    complete() { }
}
/** 
 *   Mapeamento de entidade
 *   Objeto com meta informação para realizar o mapeamento do objeto
 */
@Injectable()
export class DaoService {
    private states = new Map<any, any>();
    constructor(
        private readonly ws: WsService,
    ) { }
    /**
     * Prepara o objeto para ser editado por ReactiveFormsModule ou FormsModule Strategies.
     * 
     */
    prepareToEdit(data: any, options?: { fieldsId?: string[], onChange?: (changes: SimpleChanges) => void, debounceTime?: number }): /* SerializedObjectData */  IChangeable[] | IChangeable | Date | undefined {
        //let emitter;
        if (!data) return undefined;
        if (Array.isArray(data)) {
            return data.map(data_child =>
                this.prepareToEdit(data_child, options)) as IChangeable[];
        }
        this.ws.Atention(data);
        if (data instanceof Date) return data;
        if (data instanceof SerializedObjectData) return data;
        if (data && typeof data === 'object' && !('__pre' in data)) {
            let { __pre, __binding_form, __confirmation_subject, ...o_data } = data;
            let pre = { ...JSON.parse(JSON.stringify(o_data)) };
            const emitter = /* !!options?.onChange ? */ new EventEmitter<SimpleChanges>() /* : undefined */;
            const ws = this.ws;
            emitter.subscribe(changes => {
                ws.EmitChanges(data.internalId, changes);
            })
            let ___changes_on_changing: SimpleChanges[] | undefined;
            if (!!emitter) emitter.subscribe(r => {
                if (!___changes_on_changing) ___changes_on_changing = [];
                ___changes_on_changing.push(r);
                const _current_length = ___changes_on_changing?.length || 0;
                setTimeout(() => {
                    if (_current_length === ___changes_on_changing?.length) {
                        const changes = ___changes_on_changing;
                        ___changes_on_changing = undefined;
                        if (options?.onChange) options.onChange(
                            changes.reduce((change_a, change_b) => {
                                return {
                                    ...change_a,
                                    ...change_b,
                                } as SimpleChanges;
                            })
                        )
                    }
                }, options?.debounceTime || 500);
            });
            Object.keys(o_data).forEach(p => {  // {a:1 , b: 2, c: function(){}} ['a', 'b', 'c']
                try {
                    delete data[p];
                    Object.defineProperty(data, p, {
                        get: () => { return o_data[p]; },
                        set: (value: any) => {
                            try {
                                if (o_data[p] === value) return;
                                const old_vale = o_data[p];
                                o_data[p] = value;
                                if (!!emitter) emitter.emit({
                                    [p]: new SimpleChange(old_vale, value, false),
                                });
                            } catch (error) {
                                console.error(error);
                            }
                        },
                    });
                } catch (error) {
                    console.error(error);
                }
            })
            Object.defineProperty(data, 'toJSON', {
                value: () => {
                    try {
                        const out: any = {
                            ...this.getChanges(data, { pre })
                        };
                        (options?.fieldsId || ['id', 'internalId']).forEach(p => {
                            out[p] = data[p];
                        })
                        return out;
                    } catch (error) {
                        console.error(error);
                    }
                }
            });
            data.complete = () => pre = { ...JSON.parse(JSON.stringify(o_data)) };
            (data as any)[EMITTER] = emitter;
            Object.setPrototypeOf(data, new SerializedObjectData());
        }
        return data;
    }
    getChanges(data?: IChangeable, options?: {
        pre: any
    }) {
        if (!data) return undefined;
        const r: any = {};
        try {
            Object.getOwnPropertyNames(data).forEach(p => {
                if (p.indexOf('_') === 0) return;
                if (JSON.stringify((data as any)[p]) !== JSON.stringify(options?.pre[p])) {
                    r[p] = (data as any)[p];
                }
            })
        } catch (error) {
            console.error(error);
        }
        return r;
    }
    haveChanges(data?: IChangeable | any) {
        return Object.keys(this.getChanges(data)).length > 0;
    }
    bindDataForm(data: any, form: FormGroup, oldData?: IChangeable) {
        try {
            if (data && form) {
                form.reset(data);
                Object.keys(form.controls).forEach((v) => {
                    form.controls[v]?.valueChanges.subscribe(changedValue => {
                        try {
                            (data as any)[v] = changedValue;
                        } catch (error) {
                            console.error(error)
                        }
                    });
                })
                data.__binding_form = form;
                if (data && data[EMITTER]) (data[EMITTER] as EventEmitter<SimpleChanges>)
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
            console.error(error);
        }
    }
    async confirmChanges(data: any,) {
        try {
            if (!!data && data?.__confirmation_subject instanceof Subject) {
                (data.__confirmation_subject as Subject<any>).next(this.getChanges(data));
            }
            /// TODO: remover assinatura de evento Atention para Objeto quando for abandonado pelo componente.
            // this.ws.Atention(data);
        } catch (error) {
            console.log(data)
        }
    }
    confirmation<T>(data: T) {
        // try {
        if (!data) return undefined;
        if (!(data as any).__confirmation_subject) (data as any).__confirmation_subject = new Subject();
        return (data as any).__confirmation_subject as Subject<T>;
        // } catch (error) {
        //     console.error(error);
        // }
    }
}