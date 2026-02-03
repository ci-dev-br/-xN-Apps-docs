import { Body, Controller, Post, Request, Query, Optional } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Application } from "../model/application.entity";
import { ApplicationService } from "../service/application.service";
import { User } from "@ci/auth/models/user.entity";
import { GetInputDtos } from "../dto/input-dto";
import { Role } from "@ci/auth/decorators/role.decorator";

@Role('MASTER')
@ApiTags('Application')
@Controller('Application')
export class ApplicationController {
    constructor(
        private readonly service: ApplicationService
    ) { }

    @Post('Get')
    @ApiResponse({
        type: Application,
        isArray: true, description: 'Obter Aplicações'
    })
    @ApiOperation({
        operationId: 'GetApplication',
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
            console.trace(error);
        }
    }
    @Post('Sync')
    @ApiResponse({
        type: Application, description: 'Sincronizar Objeto de Aplicação'
    })
    @ApiOperation({

        operationId: 'SyncApplication',
    })
    async sync(
        @Body() application: Application,
        @Request() req: Request,

    ) {
        try {
            return await this.service.sync(application, req);
        } catch (error) {
            console.trace(error);
            throw error;
        }
    }
    @Post('Delete')
    @ApiResponse({
        type: Application, description: 'Excluir Cadastro de Aplicação'
    })
    @ApiOperation({
        operationId: 'DeleteApplication',
    })
    async Delete(
        @Body() application: Application
    ) {
        return await this.service.delete(application.id);
    }
}