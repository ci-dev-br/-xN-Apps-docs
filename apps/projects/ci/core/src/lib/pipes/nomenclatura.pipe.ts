import { ElementRef, Optional, Pipe, PipeTransform } from "@angular/core";
/**
 * Retorne a nomenclatura da sigla
 */
@Pipe({
    name: 'nomenclatura',
    standalone: false
})
export class NomenclaturaPipe implements PipeTransform {
    constructor(@Optional() el: ElementRef<HTMLElement>) {
        //  \ el.nativeElement.parentElement!.onclick = () => alert('oi');
    }

    transform(value: any, ...args: any[]) {
        return this.camelToTitleCase(value)
    }

    private camelToTitleCase(input: string): string {
        return input
            .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
            .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
            .trim(); // Remove any leading/trailing spaces
    }
}