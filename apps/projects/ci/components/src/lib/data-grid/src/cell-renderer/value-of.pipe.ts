import { Injector, Optional, Pipe, PipeTransform } from "@angular/core";
import { TextCellRenderer } from "./cell-renderer.component";

@Pipe({
    pure: false,
    name: 'valueOf',
    standalone: true,
})
export class ValueOfPipe implements PipeTransform {
    constructor(
        @Optional() private cell?: TextCellRenderer<any>,
        private inject?: Injector,
    ) { }
    transform(value: any, ...args: any[]) {
        const pipe: PipeTransform | undefined | null = this.cell?.column?.pipe && !!this.inject ? this.inject.get(this.cell.column.pipe, undefined, { optional: true }) : undefined;
        if (pipe) {
            const desc = this.cell?.column?.format?.split(':');
            return pipe.transform(
                value,
                desc && desc[1] ? desc[1] : undefined
            );
        }
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) {
            if (value.length === 0) return '';
            return value.map(item => this.formatObjectItem(item)).filter(Boolean).join(', ');
        }
        if (typeof value === 'object') {
            return this.formatObjectItem(value);
        }
        return value;
    }

    private formatObjectItem(item: any): string {
        if (item === null || item === undefined) return '';
        if (typeof item !== 'object') return String(item);
        return item.nome || item.name || item.title || item.description || item.logradouro || item.address || item.numeroDocumento || item.code || item.internationalCode || item.ibgeCode || item.internalId || item.id || '';
    }
}