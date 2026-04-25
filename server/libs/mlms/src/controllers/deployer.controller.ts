import { Body, Controller, Get, Post, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeployPayload } from "../dto/DeployPayload";
import { Public } from "@ci/auth/decorators/public.decorator";
import { Repository } from "typeorm";

@ApiTags('Deployer')
@Controller('Deployer')
export class DeployerController {
    /* constructor(
        private readonly repo: Repository<any>
    ) { } */
    @Public()
    @Post('report')
    async Report(
        @Body() payload: DeployPayload,
        @Request() req,
    ) {
        console.log(req.header, payload);
        return { status: 200 }
    }
}