import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DevicePayload } from "./dto/device-payload";
import { DeviceService } from "../services/device.service";
import { Public } from "@ci/auth/decorators/public.decorator";
import { PoolDto } from "./dto/pool.dto";
import { GetDeviceInput } from "./dto/get-device-input";
import { Device } from "../models/device.entity";
import { Role } from "@ci/auth/decorators/role.decorator";
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
        try {
            console.log(input);
            return await this.deviceService.connect({
                mac: input.mac,
                type: input.name,
                numbers: input.numbers
                // numbers: (input.numbers || []).filter(e => !!e.number && e.number.length > 0),
            });
        } catch (err) {
            console.trace(err)
        }
    }
    @Public()
    @ApiOperation({ operationId: 'DevicePool' })
    @Post('Pool')
    @ApiResponse({ type: PoolDto })
    public async Pool(@Body() input: DevicePayload) {
        try {
            let pool = new PoolDto();
            pool.messages = [];
            return await pool;
        } catch (err) {
            console.trace(err)
        }
    }

    @ApiOperation({ operationId: 'GetAll' })
    @Post('GetAll')
    @Role('ADMIN')
    @ApiResponse({ type: Device, isArray: true })
    public async GetAll(@Body() input?: GetDeviceInput) {
        try {
            return await this.deviceService.findAll(input?.query);
        } catch (err) {
            console.trace(err)
        }
    }
}
