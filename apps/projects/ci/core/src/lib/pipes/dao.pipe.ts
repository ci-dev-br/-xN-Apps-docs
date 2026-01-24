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
            value.surname || value.username || String(value) || 'Sem descrição')
    }
}