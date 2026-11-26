import { Body, Controller, Post, Req } from "@nestjs/common";
import { PranchetaService } from "../service/prancheta.service";
import { ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Prancheta } from "../models/prancheta.entity";
import { AudtService } from "@ci/core";

export class PranchetaSyncPayloadDto {
    @ApiProperty({ type: Prancheta, nullable: true, required: false })
    prancheta?: Prancheta;

    @ApiProperty({
        required: false,
    })
    defaultGlobalCode?: string;

    @ApiProperty({
        required: false,
        enum: ['USER', 'TENANT'],
        description: 'Escopo do Board: USER ou TENANT'
    })
    scope?: 'USER' | 'TENANT';
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
        @Req() req: any,
        @Body() input: PranchetaSyncPayloadDto
    ) {
        const tenant = req.user?.tenants?.[0]?.id || req.user?.tenantId || req.headers?.['x-tenant-id'];
        return await this.service.sincronize(
            this.audt.doSync(input.prancheta, req, !!input?.prancheta?.internalId),
            { req, tenant }
        );
    }

    @ApiResponse({
        type: Prancheta,
    })
    @Post('Get')
    async Get(
        @Req() req: any,
        @Body() input: PranchetaSyncPayloadDto
    ) {
        const tenant = req.user?.tenants?.[0]?.id || req.user?.tenantId || req.headers?.['x-tenant-id'];
        if (input.defaultGlobalCode) {
            return await this.service.Get({
                globalCode: input.defaultGlobalCode,
                tenant,
                scope: input.scope,
            });
        } else {
            return await this.service.Get({
                userId: req.user?.id,
                tenant,
                scope: input.scope,
            });
        }
    }
}
