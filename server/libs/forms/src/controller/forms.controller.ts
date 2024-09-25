import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FormsService } from "../service/forms.service";
import { Form } from "../model/form.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Post, Req } from "@nestjs/common";

export class SyncPayloadDaoForm extends SyncPayloadDao<Form> {
    @ApiProperty({ type: Form })
    override data?: Form;
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
export class FormsController extends ControllerDaoBase<FormsService, Form> {
    constructor(service: FormsService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoForm
    })
    @ApiOperation({
        operationId: 'FormsSync'
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
            Form,
        isArray: true
    })
    @ApiOperation({
        operationId: 'FormsGetList',

    })
    override async GetList(
        @Body() input: FormCotrollerGetInputDto,
        @Req() req,
    ) {
        return await super.GetList(input, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({
        type: Form,
    })
    @ApiOperation({
        operationId: 'FormsGetByInternalId',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req,
    ) {
        return await super.GetByInternalId(input, req);
    }
}