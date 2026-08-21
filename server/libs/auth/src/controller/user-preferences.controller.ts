import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('UserPreferences')
@Controller('UserPreferences')
export class UserPreferencesController {
    constructor() { }
}