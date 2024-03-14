import { EventEmitter, Injectable, SimpleChange, SimpleChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
export interface IChangeable {
    __pre: any;
    __binding_form?: FormGroup;
}
export class SerializedObjectData {
}
/*
    Mapeamento de entidade
    Objeto com meta informação para realizar o mapeamento do objeto
*/
@Injectable()
export class DaoService {
    private states = new Map<any, any>();
    constructor(
    ) { }
    prepareToEdit(data: any, options: { fieldsId?: string[] } = { fieldsId: ['id', 'internalId'] }): any | SerializedObjectData {
        if (!data) return undefined;
        if (Array.isArray(data)) {
            return data.map(data_child => this.prepareToEdit(data_child, options));
        }
        if (data instanceof SerializedObjectData) return data;
        if (data && typeof data === 'object' && !('__pre' in data)) {
            let { __pre, __binding_form, __confirmation_subject, ...o_data } = data;
            const pre = { ...JSON.parse(JSON.stringify(o_data)) };
            const emitter = new EventEmitter<SimpleChanges>();
            Object.keys(o_data).forEach(p => {
                delete data[p];
                Object.defineProperty(data, p, {
                    get: () => { return o_data[p]; },
                    set: (value: any) => {
                        if (o_data[p] === value) return;
                        const old_vale = o_data[p];
                        o_data[p] = value;
                        emitter.emit({
                            p: new SimpleChange(old_vale, value, false),
                        });
                    },
                });
            })
            Object.defineProperty(data, 'toJSON', {
                value: () => {
                    const out: any = {
                        ...this.getChanges(data, { pre })
                    };
                    (options.fieldsId || []).forEach(p => {
                        out[p] = data[p];
                    })
                    return out;
                }
            });
            Object.setPrototypeOf(data, new SerializedObjectData());
        }
        return data;
    }
    getChanges(data?: IChangeable, options?: {
        pre: any
    }) {
        if (!data) return undefined;
        const r: any = {};
        Object.getOwnPropertyNames(data).forEach(p => {
            if (p.indexOf('_') === 0) return;
            if (JSON.stringify((data as any)[p]) !== JSON.stringify(options?.pre[p])) {
                r[p] = (data as any)[p];
            }
        })
        return r;
    }
    haveChanges(data?: IChangeable) {
        return Object.keys(this.getChanges(data)).length > 0;
    }
    bindDataForm(data: any, form: FormGroup, oldData?: IChangeable) {
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
        }
    }
    async confirmChanges(data: any,) {
        if (!!data && data?.__confirmation_subject instanceof Subject) {
            (data.__confirmation_subject as Subject<any>).next(this.getChanges(data));
        }
    }
    confirmation<T>(data: T) {
        if (!data) return undefined;
        if (!(data as any).__confirmation_subject) (data as any).__confirmation_subject = new Subject();
        return (data as any).__confirmation_subject as Subject<T>;
    }
}