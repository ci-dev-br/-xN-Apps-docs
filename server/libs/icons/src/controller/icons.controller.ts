import { Role } from "@ci/auth/decorators/role.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { IconGetInput } from "./dto/icon.dto";

@Controller('Icons')
export class IconsController {
    constructor() { }
    @Role('ADMIN')
    @Post('Registry')
    async registrarNovoIcone() {
    }
    @Post('Get')
    async get(@Body() input?: IconGetInput) {
    }
}