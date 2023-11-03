import { Body, Controller, Post, Request, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Application } from "../model/application.entity";
import { ApplicationService } from "../service/application.service";
import { User } from "src/auth/models/user.entity";

@ApiTags('Application')
@Controller('Application')
export class ApplicationController {
    constructor(
        private readonly service: ApplicationService
    ) { }
    @Post('Get')
    @ApiResponse({ type: Application, isArray: true, description: 'Obter Aplicações' })
    @ApiOperation({
        operationId: 'Get'
    })
    async get(
        @Request() req: Request,
        @Query('getAll') getAll?: boolean,
    ) {
        const user: User = (req as any).user;
        return await this.service.find(user?.roles);
    }
    @Post('Sync')
    @ApiResponse({
        type: Application, description: 'Sincronizar Objeto de Aplicação'
    })
    @ApiOperation({
        operationId: 'Sync'
    })
    async sync(
        @Body() application: Application
    ) {
        return await this.service.sync(application);
    }
    @Post('Delete')
    @ApiResponse({
        type: Application, description: 'Excluir Cadastro de Aplicação'
    })
    @ApiOperation({
        operationId: 'Delete'
    })
    async Delete(
        @Body() application: Application
    ) {
        return await this.service.delete(application.id);
    }
}