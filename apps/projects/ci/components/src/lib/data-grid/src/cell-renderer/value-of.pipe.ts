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
        return value;
    }
}