import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ServerService } from "../service/server.service";
@Controller('Server')
@ApiTags('Server')
export class ServerController {
    constructor(
        private readonly server: ServerService,
    ) { }
    async handShake() {
    }
}