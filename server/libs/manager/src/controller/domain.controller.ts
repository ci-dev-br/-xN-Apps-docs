import { Body, Controller, Post, Request } from "@nestjs/common";
import { DomainService } from "../service/domain.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Domain } from "../model/domain.entity";
import { GetInputDtos } from "../dto";
import { User } from "@ci/auth/models/user.entity";
@ApiTags('Domain')
@Controller('Domain')
export class DomainController {
    constructor(
        private readonly domainService: DomainService,
    ) { }
    @Post('Get')
    @ApiResponse({
        type: Domain, description: 'Obter um ou mais registros de domínios'
    })
    @ApiOperation({
        operationId: 'GetDomain', 
    })
    async get(
        @Request() req: Request,
        @Body() input?: GetInputDtos,
    ) {
        try {
            const user: User = (req as any).user;
            return await this.domainService.find(
                (user?.roles && user?.roles?.includes('ADMIN') && input.all) ?
                    undefined : (user?.roles || []));
        } catch (error) {
            console.error(error);
        }
    }
    @Post('Sync')
    @ApiResponse({
        type: Domain, description: 'Sincronizar Objeto de Aplicação'
    })
    @ApiOperation({
        operationId: 'SyncDomain', 
    })
    async sync(
        @Body() domain: Domain
    ) {
        return await this.domainService.sync(domain);
    }
    @Post('Delete')
    @ApiResponse({
        type: Domain, description: 'Excluir Cadastro de Aplicação'
    })
    @ApiOperation({
        operationId: 'DeleteDomain', 
    })
    async Delete(
        @Body() domain: Domain
    ) {
        return await this.domainService.delete(domain.internalId);
    }
}