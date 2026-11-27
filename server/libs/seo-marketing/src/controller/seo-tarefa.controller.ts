import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SeoTarefa } from "../models/seo-tarefa.entity";
import { SeoTarefaService } from "../services/seo-tarefa.service";

export class SyncPayloadDaoSeoTarefa extends SyncPayloadDao<SeoTarefa> {
    @ApiProperty({ type: SeoTarefa })
    override data?: SeoTarefa;
}

export class ObterListaSeoTarefa {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<SeoTarefa>[] | FindOptionsWhere<SeoTarefa>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
    @ApiProperty({ nullable: true, required: false, type: String, isArray: true })
    tenantIds?: string[];
}

@ApiTags('SeoTarefa')
@Controller('SeoTarefa')
export class SeoTarefaController extends ControllerDaoBase<SeoTarefaService, SeoTarefa> {
    constructor(service: SeoTarefaService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SeoTarefa })
    @ApiOperation({ operationId: 'SyncSeoTarefa' })
    override async Sync(
        @Body() body: SyncPayloadDaoSeoTarefa,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SeoTarefa })
    @ApiOperation({ operationId: 'GetByInternalIdSeoTarefa' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SeoTarefa, isArray: true })
    @ApiOperation({ operationId: 'GetListSeoTarefa' })
    override async GetList(
        @Body() input: ObterListaSeoTarefa,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                dominio: true,
                pagina: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SeoTarefa })
    @ApiOperation({ operationId: 'DeleteSeoTarefa' })
    override async Delete(
        @Body() input: SeoTarefa,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
