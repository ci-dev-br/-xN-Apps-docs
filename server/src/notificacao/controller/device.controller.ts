import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DevicePayload } from "./dto/device-payload";
import { DeviceService } from "../services/device.service";

@Controller('Device')
@ApiTags('Device')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
    ) { }

    @ApiOperation({ operationId: 'Connect' })
    @Post('Connect')
    @ApiResponse({ type: DevicePayload })
    async connectDevice(input: DevicePayload) {
        return this.deviceService.connect({
            mac: 'not undetached'
        });
    }
}
