import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OrganizacaoService } from "../service/organizacao.service";
import { Organizacao } from "../model/organizacao.entity";
import { Status } from "@ci/core";
import { Tenant } from "src/tenant/models/tenant.entity";
import { UserService } from "src/auth/auth.module";

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
        private readonly userService: UserService,
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
    @ApiResponse({
        type: Tenant, isArray: true
    })
    @ApiOperation({ operationId: 'OrganizacaoGetCurrent' })
    async GetCurrent(
        @Req() req: any,
    ) {
        let current_user = await this.userService.findById(req.user.id);
        return current_user?.tenants || undefined;
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