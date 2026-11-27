import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Profissional } from "../models/profissional";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ProfissionalService } from "../service/profissional.service";

export class SyncPayloadDaoProfissional extends SyncPayloadDao<Profissional> {
    @ApiProperty({ type: Profissional })
    override data?: Profissional;
}

export class ObterListaProfissional {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Profissional>[] | FindOptionsWhere<Profissional>;
}

@ApiTags('Profissional')
@Controller('Profissional')
export class ProfissionalController extends ControllerDaoBase<ProfissionalService, Profissional> {
    constructor(service: ProfissionalService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Profissional })
    @ApiOperation({ operationId: 'SyncProfissional' })
    override async Sync(
        @Body() body: SyncPayloadDaoProfissional,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Profissional })
    @ApiOperation({ operationId: 'GetByInternalIdProfissional' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Profissional, isArray: true })
    @ApiOperation({ operationId: 'GetListProfissional' })
    override async GetList(
        @Body() input: ObterListaProfissional,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Profissional })
    @ApiOperation({ operationId: 'DeleteProfissional' })
    override async Delete(
        @Body() body: Profissional,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
