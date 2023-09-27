import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
export interface IChengeable {
    __pre: any;
    __binding_form?: FormGroup;
}
/*
    Mapeamento de entidade
    Objeto com meta informação para realizar o mapeamento do objeto


*/
@Injectable()
export class DaoService {
    constructor(
    ) { }
    prepareToEdit(data: any) {
        if (data && typeof data === 'object' && !('__pre' in data)) {
            data.__pre = { ...JSON.parse(JSON.stringify(data)) }
        }
        return data as IChengeable;
    }
    getChanges(data?: IChengeable, options?: {
    }) {
        const { __pre, __binding_form, ...__cleaned_data } = data as any;
        const r = JSON.parse(JSON.stringify(__cleaned_data));
        Object.keys(__pre).forEach(pn => {
            if (JSON.stringify(r[pn]) !== JSON.stringify(__pre[pn])) {

            } else {
                r[pn] = undefined;
            }
        })
        return r;
    }
    haveChanges(data?: IChengeable) {
        return Object.keys(this.getChanges(data)).length > 0;
    }
    bindDataForm(data: any, form: FormGroup, oldData?: IChengeable) {
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
}