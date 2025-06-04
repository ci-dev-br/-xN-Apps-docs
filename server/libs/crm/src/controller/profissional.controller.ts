import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Profissional } from "../models/profissional";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ProfissionalService } from "../service/profissional.service";
export class SyncPayloadDaoProfissional extends SyncPayloadDao<Profissional> {
    @ApiProperty({ type: Profissional })
    override data?: Profissional;
}
export class ObterListaProfissional {
    // override data?: Profissional;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Profissional>[] | FindOptionsWhere<Profissional>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Profissional')
@Controller('Profissional')
export class ProfissionalController extends ControllerDaoBase<ProfissionalService, Profissional> {
    constructor(
        service: ProfissionalService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Profissional,
    })
    @ApiOperation({
        operationId: 'SyncProfissional'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoProfissional,
    ) {
        try {
            return await super.Sync(body)
        } catch (error) {
            return {
                status: 500,
                message: 'Falha',
                detahes: error.message,
                stack: error.stack
            } as any
        }
    }
    @Post('GetList')
    @ApiResponse({
        type: Profissional, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListProfissional'
    })
    override async GetList(
        @Body() input: ObterListaProfissional,
    ) {
        return super.GetList(input);
    }
}