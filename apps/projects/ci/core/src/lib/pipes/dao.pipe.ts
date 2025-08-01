import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'dao',
    pure: true,
    standalone: false,
})
export class DaoPipe implements PipeTransform {
    transform(value: any, ...args: any[]) {
        return (
            value.name || value.nome ||
            value.title || value.titulo ||
            value.descricao || value.description ||
            value.surname || value.username ||
                /* (() => {
                    if (typeof value === 'object') {
                        const a = Object.keys(value).find(p => p.indexOf('name') > -1 || p.indexOf('nome') > -1);
                        if (a) return value[a]
                    }
                })()  */'Sem descrição')
    }
}