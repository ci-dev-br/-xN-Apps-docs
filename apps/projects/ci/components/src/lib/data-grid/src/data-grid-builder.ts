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
@Injectable()
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
        const properties = await (await this.daoBuilder.getSchema(schemaName)).properties
        let gridOptions = {
            columns: [
                ...Object.keys(properties || {}).map(property => {
                    const prop = properties![property];
                    const headerName = prop?.title || property;
                    const fieldName = property;
                    const type = prop.type || 'text';
                    const format = prop.format || undefined;
                    const pipe = prop.format ? this.getPipeOfFormat(prop.format) : undefined;
                    const component = undefined;
                    return {
                        headerName,
                        fieldName,
                        type,
                        format,
                        pipe,
                        component,
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
        const pipes = this.injector.get<any>('XNE.PIPES');
        const pipe = Object.keys(pipes).find(pipe_code => (
            format.split(':')[0] === pipe_code
        ))
        return pipe ? pipes[pipe] : undefined;
    }
}