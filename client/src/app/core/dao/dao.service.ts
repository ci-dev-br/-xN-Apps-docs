import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, Subject } from "rxjs";
export interface IChangeable {
    __pre: any;
    __binding_form?: FormGroup;
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
    prepareToEdit(data: any) {
        if (!data) return undefined;
        if (data && typeof data === 'object' && !('__pre' in data)) {
            let { __pre, __binding_form, __confirmation_subject, ...o_data } = data;
            data.__pre = { ...JSON.parse(JSON.stringify(o_data)) }
        }
        return data as IChangeable;
    }
    getChanges(data?: IChangeable, options?: {
    }) {
        if (!data) return undefined;
        const { __pre, __binding_form, __confirmation_subject, ...__cleaned_data } = data as any;
        const r = JSON.parse(JSON.stringify(__cleaned_data));
        if (__pre) {
            Object.keys(__pre).forEach(pn => {
                if (r[pn] && JSON.stringify(r[pn]) !== JSON.stringify(__pre[pn])) {
                } else {
                    delete r[pn];
                }
            });
        } else {
            return {};
        }
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
    getObjectInternalStage(o: any) {

    }

}