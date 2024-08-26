import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DevicePayload } from "./dto/device-payload";
import { DeviceService } from "../services/device.service";
import { Public } from "@ci/auth/decorators/public.decorator";
import { PoolDto } from "./dto/pool.dto";

/**
 * Dispositivo Auto-Declarado
 * 
 *  Os dispositivos auto-declarados são os aparelhos que estão solicitando 
 * interação com o sistema. 
 */
@Controller('Device')
@ApiTags('Device')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
    ) { }
    @Public()
    @ApiOperation({ operationId: 'Device.Connect' })
    @Post('Connect')
    @ApiResponse({ type: DevicePayload })
    public async connectDevice(@Body() input: DevicePayload) {
        console.log(input);
        return await this.deviceService.connect({
            mac: input.id,
            type: input.name,
            numbers: input.numbers
            //  numbers: (input.numbers || []).filter(e => !!e.number && e.number.length > 0),
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
