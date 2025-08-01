import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@ci/auth/auth.module";
import { User } from "@ci/auth/models/user.entity";
@ApiTags('User')
@Controller('User')
export class UserController {
    constructor(
        private readonly user?: UserService,
    ) { }
    @Post('Sync')
    @ApiOperation({ operationId: 'SyncUser' })
    @ApiResponse({
        type: User,
    })
    async sync(
        @Req() req: any,
        @Body() user: User) {
        if (!!req.user?.id && req.user?.id === user.id) {
            return await this.user.sync(user);
        }
    }
    @Post('GetList')
    @ApiOperation({ operationId: 'GetListUser' })
    @ApiResponse({
        type: User,
        isArray: true
    })
    async getList(
        @Req() req: any
    ) {
        return (await this.user.find())?.map(u => {
            delete u.password;
            if (!!u.email) {
                u.email = u.email.substring(0, 3) + '***' + u.email.substring(u.email.length - 8, 3);
            }
            delete u.email;
            delete u.passwordMode;

            return u;
        });
    }
}