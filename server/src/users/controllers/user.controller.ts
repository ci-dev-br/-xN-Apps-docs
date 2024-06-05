import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "src/auth/auth.module";
import { User } from "src/auth/models/user.entity";

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
    @ApiOperation({ operationId: 'UserGetList' })
    @ApiResponse({
        type: User,
        isArray: true
    })
    async getList(
        @Req() req: any
    ) {
        return await this.user.find();
    }
}