import { Controller, Post } from "@nestjs/common";
import { CPUInfo, SystemService } from "./system.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Status } from "./model/status";
@Controller('System')
@ApiTags('System')
export class SystemController {
    constructor(private readonly service: SystemService) { }
    @Post('Leitura')
    @ApiOperation({ operationId: 'SystemLeitura', tags: ['System'] })
    @ApiResponse({
        type: CPUInfo, isArray: true
    })
    async Leitura(): Promise<CPUInfo[]> {
        return await this.service.leitura();
    }
}