import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
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
    override async sync(
        @Body() input: SyncPayloadDaoForm,
        @Req() req?: any,
    ) {
        return await super.sync(input, req);
    }

    @Post('Get')
    @ApiResponse({
        type:
            Form,
        isArray: true
    })
    @ApiOperation({
        operationId: 'FormsGet',

    })
    override async get(
        @Body() input: FormCotrollerGetInputDto,
        @Req() req,
    ) {
        return await super.get(input, req);
    }
}