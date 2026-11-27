import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Term } from "../models/term.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { TermService } from "../services/term.service";

export class SyncPayloadDaoTerm extends SyncPayloadDao<Term> {
    @ApiProperty({ type: Term })
    override data?: Term;
}

export class ObterListaTerm {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Term>[] | FindOptionsWhere<Term>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('Term')
@Controller('Term')
export class TermController extends ControllerDaoBase<TermService, Term> {
    constructor(service: TermService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Term })
    @ApiOperation({ operationId: 'SyncTerm' })
    override async Sync(
        @Body() body: SyncPayloadDaoTerm,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Term })
    @ApiOperation({ operationId: 'GetByInternalIdTerm' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Term, isArray: true })
    @ApiOperation({ operationId: 'GetListTerm' })
    override async GetList(
        @Body() input: ObterListaTerm,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: { website: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Term })
    @ApiOperation({ operationId: 'DeleteTerm' })
    override async Delete(
        @Body() input: Term,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
