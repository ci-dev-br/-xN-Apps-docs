import { Body, Controller, Post, Req } from "@nestjs/common";
import { PranchetaService } from "../service/prancheta.service";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Prancheta } from "../models/prancheta.entity";
import { AudtService } from "src/core/audt/audt.service";

export class PranchetaSyncPayloadDto {
    @ApiProperty({ type: Prancheta, nullable: true, required: false })
    pranchta?: Prancheta
}
@ApiTags('Prancheta')
@Controller('Prancheta')
export class PranchetaController {
    constructor(
        private readonly service: PranchetaService,
        private readonly audt: AudtService,
    ) { }

    @ApiResponse({
        type: Prancheta
    })
    @Post('Sync')
    async Sync(
        @Req() req: Request,
        @Body() input: PranchetaSyncPayloadDto
    ) {
        return await this.service.sincronize(this.audt.doSync(input.pranchta, req, !!input?.pranchta?.internalId));
    }
    @ApiResponse({
        type: Prancheta, isArray: true
    })
    @Post('Get')
    async Get(
        @Req() req: any,
        @Body() input: PranchetaSyncPayloadDto) {
        return await this.service.Get({
            userId: req.user.id
        })
    }
}