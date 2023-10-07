import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Application } from "../model/application.entity";
import { ApplicationService } from "../service/application.service";

@ApiTags('Application')
@Controller('Application')
export class ApplicationController {
    constructor(
        private readonly service: ApplicationService
    ) { }
    @Post('Get')
    @ApiResponse({ type: Application, isArray: true, description: 'Obter Aplicações' })
    @ApiOperation({ operationId: 'Get' })
    async get() {
        return await this.service.find();
    }
    @Post('Sync')
    @ApiResponse({ type: Application, description: 'Sincronizar Objeto de Aplicação' })
    @ApiOperation({ operationId: 'Sync' })
    async sync(
        @Body() application: Application
    ) {
        return await this.service.sync(application);
    }
    @Post('Delete')
    @ApiResponse({ type: Application, description: 'Excluir Cadastro de Aplicação' })
    @ApiOperation({ operationId: 'Delete' })
    async Delete(
        @Body() application: Application
    ) {
        return await this.service.delete(application.id);
    }
}