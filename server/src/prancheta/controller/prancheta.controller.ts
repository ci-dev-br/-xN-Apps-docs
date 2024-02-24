import { Controller, Post } from "@nestjs/common";
import { PranchetaService } from "../service/prancheta.service";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { Prancheta } from "../models/prancheta.entity";

export class PranchetaSyncPayloadDto {
    @ApiProperty({ type: Prancheta, nullable: true, required: false })
    pranchta?: Prancheta
}
@ApiTags('Prancheta')
@Controller('Prancheta')
export class PranchetaController {
    constructor(
        private readonly service: PranchetaService,
    ) { }
    @Post('Sync')
    async Sync(input: PranchetaSyncPayloadDto) {
        return await this.service.sincronize(input.pranchta);
    }
    @Post('Get')
    async Get(input: PranchetaSyncPayloadDto) {
        return await this.service.sincronize(input.pranchta);
    }
}