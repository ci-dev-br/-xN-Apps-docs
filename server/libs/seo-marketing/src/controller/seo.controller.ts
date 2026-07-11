import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
/**
 * Controller Seo Settings
 */
const ControllerName = 'Seo';
/*
 * SEO Controller API
 */
@ApiTags(ControllerName)
@Controller(ControllerName)
export class SEOController {
    constructor(
    ) { }
    @ApiOperation({ operationId: `Listar${ControllerName}` })
    @Post(`Listar`)
    public async ListarAgentes() {
    }
    @ApiOperation({ operationId: `Sync${ControllerName}` })
    @Post('Sincronizar')
    public async SincronizarAgente() {
    }
}