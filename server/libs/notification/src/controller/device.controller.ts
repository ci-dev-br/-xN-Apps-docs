import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DevicePayload } from "./dto/device-payload";
import { DeviceService } from "../services/device.service";
import { Public } from "@ci/auth/decorators/public.decorator";
import { PoolDto } from "./dto/pool.dto";

@Controller('Device')
@ApiTags('Device')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
    ) { }

    @Public()
    @ApiOperation({ operationId: 'DeviceConnect' })
    @Post('Connect')
    @ApiResponse({ type: DevicePayload })
    public async connectDevice(@Body() input: DevicePayload) {
        console.log(input);
        return await this.deviceService.connect({
            mac: input.id,
            type: input.name
        });
    }

    @Public()
    @ApiOperation({ operationId: 'DevicePool' })
    @Post('Pool')
    @ApiResponse({ type: PoolDto })
    public async Pool(@Body() input: DevicePayload) {
        let pool = new PoolDto();
        pool.messages = [];
        return await pool;
    }
}
