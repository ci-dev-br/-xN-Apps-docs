import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { Aula } from "../models/aula.entity";
import { AulaService } from "../service/aula.service";
import {
    AnexarMaterialAulaInputDto,
    AnexarVideoAulaInputDto,
    ObterListaAula,
    RemoverMaterialAulaInputDto,
    SyncPayloadDaoAula,
} from "../dto/treinamento.dto";

@Role('USER')
@ApiTags('Aula')
@Controller('Aula')
export class AulaController extends ControllerDaoBase<AulaService, Aula> {
    constructor(private readonly aulaService: AulaService) {
        super(aulaService);
    }

    @Post('Sync')
    @ApiResponse({ type: Aula })
    @ApiOperation({ operationId: 'SyncAula' })
    override async Sync(@Body() body: SyncPayloadDaoAula, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Aula })
    @ApiOperation({ operationId: 'GetByInternalIdAula' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Aula, isArray: true })
    @ApiOperation({ operationId: 'GetListAula' })
    override async GetList(@Body() input: ObterListaAula, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Aula })
    @ApiOperation({ operationId: 'DeleteAula' })
    override async Delete(@Body() body: Aula, @Req() req?: any) {
        return await super.Delete(body, req);
    }

    @Post('AnexarVideo')
    @ApiResponse({ type: Aula })
    @ApiOperation({ operationId: 'AnexarVideoAula' })
    async AnexarVideo(@Body() input: AnexarVideoAulaInputDto, @Req() req?: any) {
        return await this.aulaService.anexarVideo(input, req);
    }

    @Post('AnexarMaterial')
    @ApiResponse({ type: Aula })
    @ApiOperation({ operationId: 'AnexarMaterialAula' })
    async AnexarMaterial(@Body() input: AnexarMaterialAulaInputDto, @Req() req?: any) {
        return await this.aulaService.anexarMaterial(input, req);
    }

    @Post('RemoverMaterial')
    @ApiResponse({ type: Aula })
    @ApiOperation({ operationId: 'RemoverMaterialAula' })
    async RemoverMaterial(@Body() input: RemoverMaterialAulaInputDto) {
        return await this.aulaService.removerMaterial(input);
    }
}
