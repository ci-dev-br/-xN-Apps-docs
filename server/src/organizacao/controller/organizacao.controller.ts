import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OrganizacaoService } from "../service/organizacao.service";
import { Organizacao } from "../model/organizacao.entity";

export class OrganizacaoSyncPayload {
    @ApiProperty({ type: Organizacao })
    data: Organizacao
}
export class OrganizacaoSyncOutput {
    @ApiProperty({ type: Organizacao })
    out: Organizacao
}

export class OrganizacaoFindPayload {
    @ApiProperty({ nullable: true, required: true })
    query: string
}

export class OrganizacaoFindResult {
    @ApiProperty({ nullable: true, required: true, type: Organizacao, isArray: true })
    0: Organizacao[];
    @ApiProperty({ nullable: true, required: true })
    1: number;
}

@Controller('Organizacao')
@ApiTags('Organizacao')
export class OrganizacaoController {
    constructor(
        private readonly organizacaoService: OrganizacaoService,
    ) { }
    @Post('Sync')
    @ApiOperation({ operationId: 'OrganizacaoSync' })
    async sync(
        @Req() req: any,
        @Body() input: OrganizacaoSyncPayload,
    ) {
        return await this.organizacaoService.syncronizar(input.data);
    }
    @Post('GetCurrent')
    @ApiOperation({ operationId: 'OrganizacaoGetCurrent' })
    async GetCurrent(
        @Req() req: any,
    ) {
        return await this.organizacaoService.current(req.user.id);
    }

    @ApiResponse({
        type: OrganizacaoFindResult,
    })
    @Post('Find')
    @ApiOperation({ operationId: 'OrganizacaoFind' })
    async Find(
        @Req() req: any, @Body() input: OrganizacaoFindPayload
    ) {
        return await this.organizacaoService.Find(input.query);
    }
}