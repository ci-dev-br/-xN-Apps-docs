import { Body, Controller, Post, Request, Query, Optional } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Application } from "../model/application.entity";
import { ApplicationService } from "../service/application.service";
import { User } from "@ci/auth/models/user.entity";
import { GetInputDtos } from "../dto/input-dto";

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
        @Body() input?: GetInputDtos,
    ) {
        try {
            const user: User = (req as any).user;
            return await this.service.find(
                (user?.roles && user?.roles?.includes('ADMIN') && input.all) ?
                    undefined : (user?.roles || []));
        } catch (error) {
            console.error(error);
        }
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