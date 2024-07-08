import { Body, Controller, Post } from "@nestjs/common";
import { DomainService } from "../service/domain.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Domain } from "../model/domain.entity";

@ApiTags('Domain')
@Controller('Domain')
export class DomainController {
    constructor(
        private readonly domainService: DomainService,
    ) { }
    @Post('Sync')
    @ApiResponse({
        type: Domain, description: 'Sincronizar Objeto de Aplicação'
    })
    @ApiOperation({
        operationId: 'DomainSync'
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
        operationId: 'DomainDelete'
    })
    async Delete(
        @Body() domain: Domain
    ) {
        return await this.domainService.delete(domain.id);
    }
}