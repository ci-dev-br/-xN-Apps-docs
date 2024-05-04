import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DevicePayload } from "./dto/device-payload";
import { DeviceService } from "../services/device.service";
import { Public } from "src/auth/decorators/public.decorator";

@Controller('Device')
@ApiTags('Device')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
    ) { }

    @Public()
    @ApiOperation({ operationId: 'Connect' })
    @Post('Connect')
    @ApiResponse({ type: DevicePayload })
    async connectDevice(@Body() input: DevicePayload) {
        console.log(input);
        return await this.deviceService.connect({
            mac: input.id,
        });
    }
}
