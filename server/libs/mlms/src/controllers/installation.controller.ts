import { Role } from "@ci/auth/decorators/role.decorator";
import { Controller, Post, Req, Res } from "@nestjs/common";

@Controller("Installation")
export class InstallationController {

    @Role('DEVELOPPER')
    @Post('Installation')
    async Installation(
        @Res() res: Response,
        @Req() req: Request,
    ) {
        try {

        } catch (error) {
            console.trace(error);
        }
    }
}