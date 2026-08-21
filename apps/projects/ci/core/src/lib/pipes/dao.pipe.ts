import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'dao',
    pure: true,
    standalone: false,
})
export class DaoPipe implements PipeTransform {
    // TODO:  carregar contexto do elemento do componente para ajustar a visualização da informação
    constructor(){}
    transform(value: any, ...args: any[]) {
        return (
            value.name || value.nome ||
            value.title || value.titulo ||
            value.descricao || value.description ||
            value.surname || value.username || String(value) || 'Sem descrição')
    }
}