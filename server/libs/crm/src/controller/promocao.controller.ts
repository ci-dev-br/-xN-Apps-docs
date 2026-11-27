import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Promocao } from "../models/promocao";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { PromocaoService } from "../service/promocao.service";

export class SyncPayloadDaoPromocao extends SyncPayloadDao<Promocao> {
    @ApiProperty({ type: Promocao })
    override data?: Promocao;
}

export class ObterListaPromocao {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Promocao>[] | FindOptionsWhere<Promocao>;
}

@ApiTags('Promocao')
@Controller('Promocao')
export class PromocaoController extends ControllerDaoBase<PromocaoService, Promocao> {
    constructor(service: PromocaoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Promocao })
    @ApiOperation({ operationId: 'SyncPromocao' })
    override async Sync(
        @Body() body: SyncPayloadDaoPromocao,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Promocao })
    @ApiOperation({ operationId: 'GetByInternalIdPromocao' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Promocao, isArray: true })
    @ApiOperation({ operationId: 'GetListPromocao' })
    override async GetList(
        @Body() input: ObterListaPromocao,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Promocao })
    @ApiOperation({ operationId: 'DeletePromocao' })
    override async Delete(
        @Body() body: Promocao,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
