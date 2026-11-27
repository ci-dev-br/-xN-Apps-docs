import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Servico } from "../models/servico";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ServicoService } from "../service/servico.service";

export class SyncPayloadDaoServico extends SyncPayloadDao<Servico> {
    @ApiProperty({ type: Servico })
    override data?: Servico;
}

export class ObterListaServico {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Servico>[] | FindOptionsWhere<Servico>;
}

@ApiTags('Servico')
@Controller('Servico')
export class ServicoController extends ControllerDaoBase<ServicoService, Servico> {
    constructor(service: ServicoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Servico })
    @ApiOperation({ operationId: 'SyncServico' })
    override async Sync(
        @Body() body: SyncPayloadDaoServico,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Servico })
    @ApiOperation({ operationId: 'GetByInternalIdServico' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Servico, isArray: true })
    @ApiOperation({ operationId: 'GetListServico' })
    override async GetList(
        @Body() input: ObterListaServico,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Servico })
    @ApiOperation({ operationId: 'DeleteServico' })
    override async Delete(
        @Body() body: Servico,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
