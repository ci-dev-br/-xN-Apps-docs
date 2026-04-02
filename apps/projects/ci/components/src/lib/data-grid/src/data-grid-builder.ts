import { Injectable } from "@angular/core";
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
                    const headerName = properties ? properties[property].title : property;
                    const fieldName = property;
                    return {
                        headerName,
                        fieldName,
                        hide: fieldName && ['internalId', 'id'].indexOf(fieldName) > -1
                    } as IColumnOption<any>
                })
            ]
        }
        return gridOptions;
    }
}