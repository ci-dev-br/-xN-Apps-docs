import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PhotoService } from "../service/photo.service";
import { Photo } from "../models/photo.entity";
import { UserService } from "src/auth/auth.module";
import { AudtService } from "src/core/audt/audt.service";

export class PhotoGetPaylodInputDto {
    @ApiProperty({ nullable: true, required: false }) query: string;
    @ApiProperty({ nullable: true, required: false }) limit: string;
    @ApiProperty({ nullable: true, required: false }) offset: string;
}

@ApiTags('Photo')
@Controller('Photo')
export class PhotoController {
    constructor(
        private readonly photoService: PhotoService,
        private readonly userService: UserService,
        private readonly audt: AudtService,
    ) { }

    @Post('Sync')
    @ApiOperation({ operationId: 'SyncPhoto' })
    @ApiResponse({
        type: Photo,
    })
    async Sync(
        @Req() req: Request,
        @Body() payload: Photo) {
        //if (!payload.internalId) {
        //    // const user_id = (req as any).user.id;
        //    // console.log(user_id);
        //}

        const photo = await this.photoService.Sync(this.audt.doSync(payload, req, !!payload.internalId));

        return photo
    }

    @Post('Get')
    @ApiOperation({ operationId: 'GetPhoto' })
    @ApiResponse({
        type: Photo,
        isArray: true
    })
    async Get(
        @Req() req: Request,
        @Body() payload: PhotoGetPaylodInputDto
    ) {
        return await this.photoService.Get(payload.query);
    }
}