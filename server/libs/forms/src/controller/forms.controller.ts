import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FormsService } from "../service/forms.service";
import { Forms } from "../model/form.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Post, Req } from "@nestjs/common";
export class SyncPayloadDaoForm extends SyncPayloadDao<Forms> {
    @ApiProperty({ type: Forms })
    override data?: Forms;
}
export class FormCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    where?: any;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
}
@ApiTags('Forms')
@Controller('Forms')
export class FormsController extends ControllerDaoBase<FormsService, Forms> {
    constructor(service: FormsService) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Forms,
    })
    @ApiOperation({
        operationId: 'SyncForms'
    })
    override async Sync(
        @Body() input: SyncPayloadDaoForm,
        @Req() req?: any,
    ) {
        return await super.Sync(input, req);
    }
    @Post('GetList')
    @ApiResponse({
        type:
            Forms,
        isArray: true
    })
    @ApiOperation({
        operationId: 'GetListForms',
    })
    override async GetList(
        @Body() input: FormCotrollerGetInputDto,
        @Req() req,
    ) {
        return await super.GetList(input, req);
    }
    @Post('GetByInternalId')
    @ApiResponse({
        type: Forms,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdForms',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req,
    ) {
        return await super.GetByInternalId(input, req);
    }
    @Post('Delete')
    @ApiResponse({
        type: Forms,
    })
    @ApiOperation({
        operationId: 'DeleteForms',
    })
    override async Delete(
        @Body() input: GetByInternalIdInputDto,
        @Req() req,
    ) {
        return await super.Delete(input, req);
    }
}