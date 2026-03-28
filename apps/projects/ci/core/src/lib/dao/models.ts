import { FormGroup } from "@angular/forms";

export function OfString(data: any): string {
    return (
        data.name || data.nome ||
        data.title || data.titulo ||
        data.descricao || data.description ||
        (() => {
            const a = Object.keys(data)
                .find(p => p.indexOf('name') > -1 || p.indexOf('nome') > -1);
            if (a) return data[a]
            return Object.keys(data)
                .filter(x =>
                    x !== 'internalId' &&
                    x.indexOf('At') === -1 &&
                    typeof data[x] === 'string')
                .map(x => {
                    return data[x]
                }).join(' ');
        })() || '(registro vazio)')
}

/**
 * Objeto alterável pela interface do usuário
 */
export interface IChangeable {
    /***
     * Snapshot do objeto antes de iniciar as mudanças no objeto.
     */
    __pre?: any;
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