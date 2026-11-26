import { Injectable, Injector, PipeTransform, Type } from "@angular/core";
import { DaoBuilder } from "@ci/core";
import { IColumnOption } from "./models/i-column-options";
/**
 * Service to build grid options
 * 
 * ## Description
 * This service provides methods to build grid options for data grids based on various criteria such as schema definitions.
 * ## Example Usage
 * ```typescript
 * import { GridBuilder } from "@ci/components";    
 * @Component({
 *   // component metadata      
 * })
 * export class ExampleComponent {
 *   constructor(private gridBuilder: GridBuilder) {}       
 */
@Injectable({
    providedIn: 'root'
})
export class GridBuilder {
    constructor(
        private readonly daoBuilder: DaoBuilder,
        private readonly injector: Injector,
    ) { }
    /**
     *  Build grid options from schema
     * @returns 
     */
    async FromSchema(schemaName: string): Promise<{ columns: IColumnOption<any>[] }> {
        const schema = await this.daoBuilder.getSchema(schemaName);
        const properties = schema?.properties;
        let gridOptions = {
            columns: [
                ...Object.keys(properties || {}).map(property => {
                    const prop = properties![property];
                    const headerName = prop?.title || property;
                    const fieldName = property;
                    const format = prop.format || undefined;
                    const rawType = (prop.type || 'text').toLowerCase();
                    const type =
                        rawType === 'boolean'
                            ? 'boolean'
                            : format === 'date-time' || format === 'datetime'
                                ? 'date-time'
                                : format === 'date' || rawType === 'date'
                                    ? 'date'
                                    : format === 'time'
                                        ? 'time'
                                        : rawType === 'integer'
                                            ? 'integer'
                                            : rawType === 'number'
                                                ? 'number'
                                                : rawType === 'array' || prop.isArray
                                                    ? 'array'
                                                    : rawType === 'object' || prop.$ref
                                                        ? 'object'
                                                        : rawType === 'string'
                                                            ? 'text'
                                                            : rawType;
                    const pipe = prop.format ? this.getPipeOfFormat(prop.format) : undefined;
                    const component = undefined;
                    return {
                        headerName,
                        fieldName,
                        type,
                        format,
                        pipe,
                        component,
                        schemaProperty: prop,
                        hide: fieldName && [
                            'internalId',
                            'id',
                            'createdAt',
                            'createdBy',
                            'lastModifiedAt',
                            'lastModifiedBy',
                            'tenants',
                            'deleted'
                        ].indexOf(fieldName) > -1
                    } as IColumnOption<any>
                })
            ]
        }
        return gridOptions;
    }
    /**
     * Retorna o pipe para o formato indicado
     * @param format 
     * @returns 
     */
    private getPipeOfFormat(format: string) {
        const pipes = this.injector.get<any>('XNE.PIPES', null);
        if (!pipes) return undefined;
        const pipe = Object.keys(pipes).find(pipe_code => (
            format.split(':')[0] === pipe_code
        ))
        return pipe ? pipes[pipe] : undefined;
    }
}