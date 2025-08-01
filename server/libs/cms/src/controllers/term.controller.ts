import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Term } from "../models/term.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { TermService } from "../services/term.service";
export class SyncPayloadDaoTerm extends SyncPayloadDao<Term> {
    @ApiProperty({ type: Term })
    override data?: Term;
}
export class ObterListaTerm {
    // override data?: Term;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Term>[] | FindOptionsWhere<Term>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Term')
@Controller('Term')
export class TermController extends ControllerDaoBase<TermService, Term> {
    constructor(
        service: TermService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Term,
    })
    @ApiOperation({
        operationId: 'SyncTerm'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoTerm,
        @Request() req: Request,
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
        type: Term, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListTerm'
    })
    override async GetList(
        @Body() input: ObterListaTerm,
        @Request() req: Request,
    ) {
        return super.GetList(input, req);
    }
    @Post('Delete')
    @ApiResponse({
        type: Term, isArray: true
    })
    @ApiOperation({
        operationId: 'DeleteTerm'
    })
    override async Delete(
        @Body() input: Term,
        @Request() req: Request,
    ) {
        return super.Delete(input, req);
    }
}