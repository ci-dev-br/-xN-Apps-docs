import { Body, Controller, Post } from "@nestjs/common";
import { I11nService } from "../services/i11n.service";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Dictionary } from "../models/dictionary.entity";
export class I11NInput {
    @ApiProperty({ nullable: true, required: false }) codes: string[];
    @ApiProperty({ nullable: true, required: false }) languageCode: string;
}
@ApiTags('I11n')
@Controller('I11n')
export class I11nController {
    constructor(
        private readonly service: I11nService,
    ) { }
    @Post('GetDictionary')
    @ApiResponse({
        type:
            Dictionary,
        isArray: true
    })
    @ApiOperation({
        operationId: 'GetDictionaryI11n',
    })
    async GetDictionary(
        @Body() input: I11NInput
    ) {
        return await this.service.getDictionaryByCodes(input.codes, input.languageCode);
    }
}