import { Controller, Post } from "@nestjs/common";
import { SystemService } from "./system.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Status } from "./model/status";
@Controller('System')
@ApiTags('System')
export class SystemController {
    constructor(private readonly service: SystemService) { }

    @Post('Leitura')
    @ApiOperation({ operationId: 'Leitura', tags: ['System'] })
    @ApiResponse({
        type: Status, isArray: true
    })
    async Leitura() {
        return await this.service.leitura();
    }
}