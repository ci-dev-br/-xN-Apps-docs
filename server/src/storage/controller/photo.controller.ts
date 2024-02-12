import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PhotoService } from "../service/photo.service";
import { Photo } from "../models/photo.entity";
import { UserService } from "src/auth/auth.module";

@ApiTags('Photo')
@Controller('Photo')
export class PhotoController {
    constructor(
        private readonly service: PhotoService,
        private readonly userService: UserService,
    ) { }

    @Post('Sync')
    @ApiOperation({ operationId: 'SyncPhoto' })
    @ApiResponse({
        type: Photo,
    })
    async Sync(
        @Req() req: Request,
        @Body() payload: Photo) {
        const photo = await this.service.Sync(payload);
        if (!payload.id) {
            const user_id = (req as any).user.id;
            console.log(user_id);
        }
        return photo
    }
}