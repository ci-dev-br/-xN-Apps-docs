import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Application } from "../models/application.entity";
import { ApplicationService } from "../service/application.service";

@ApiTags('Application')
@Controller('Application')
export class ApplicationController {
    constructor(
        private readonly service: ApplicationService
    ) { }

    @Post('Get')
    @ApiResponse({ type: Application, isArray: true })
    @ApiOperation({ operationId: 'Get' })
    async get() {
        return await this.service.find();
    }
}