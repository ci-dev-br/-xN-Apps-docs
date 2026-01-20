import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ClienteCrm } from "../models/cliente";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ClienteCrmService } from "../service/cliente-crm.service";
export class SyncPayloadDaoClienteCrm extends SyncPayloadDao<ClienteCrm> {
    @ApiProperty({ type: ClienteCrm })
    override data?: ClienteCrm;
}
export class ObterListaClienteCrm {
    // override data?: ClienteCrm;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<ClienteCrm>[] | FindOptionsWhere<ClienteCrm>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('ClienteCrm')
@Controller('ClienteCrm')
export class ClienteCrmController extends ControllerDaoBase<ClienteCrmService, ClienteCrm> {
    constructor(
        service: ClienteCrmService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: ClienteCrm,
    })
    @ApiOperation({
        operationId: 'SyncClienteCrm'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoClienteCrm,
        @Req() req,
    ) {
        try {
            return await super.Sync(body, req)
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
        type: ClienteCrm, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListClienteCrm'
    })
    override async GetList(
        @Body() input: ObterListaClienteCrm,
        @Req() req,
    ) {
        return super.GetList(input, req);
    }
}