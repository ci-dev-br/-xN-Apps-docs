import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeployPayload } from "../dto/DeployPayload";
import { Public } from "@ci/auth/decorators/public.decorator";

@ApiTags('Deployer')
@Controller('Deployer')
export class DeployerController {
    constructor() { }

    @Public()
    @Post('report')
    async Report(
        @Body() payload: DeployPayload
    ) {
        console.log('[payload]', payload);
        return { status: 200 }
    }
}