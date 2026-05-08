import { EventEmitter, Injectable, SimpleChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { of, Subject } from "rxjs";
import { IChangeable, OfString } from "./models";
import { EMITTER } from "../emitter/token";

/** 
 *   Mapeamento de entidade
 *   Objeto com meta informação para realizar o mapeamento do objeto
 */
@Injectable()
export class DaoService {
    private states = new Map<any, any>();

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
        return of().toPromise();
    }
    getChanges(data?: IChangeable, options?: {
        pre: any
    }) {
        if (!data) return undefined;
        const r: any = {};
        try {
            Object.getOwnPropertyNames(data).forEach(p => {
                if (p.indexOf('_') === 0 || p.indexOf(':') === 0) return;
                // TODO:  identificar mudança em relação ao pre
                if (!options || !options.pre || (!!options && !!options.pre && JSON.stringify((data as any)[p]) !== JSON.stringify(options?.pre[p]))) {
                    r[p] = (data as any)[p];
                } else {

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
                (data.__confirmation_subject as Subject<any>).next(this.getChanges(data));
            }
            /// TODO: remover assinatura de evento Attention para Objeto quando for abandonado pelo componente.
            // this.ws.Attention(data);
        } catch (error) {
            console.log(data)
        }
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