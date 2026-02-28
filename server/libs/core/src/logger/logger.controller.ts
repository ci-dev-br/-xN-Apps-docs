import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * Logger Services
 */
@ApiTags('Logger')
@Controller('Logger')
export class LoggerController {
    constructor() { }
    /**
     * Registry
     */
    async registry() {
        
    }
}