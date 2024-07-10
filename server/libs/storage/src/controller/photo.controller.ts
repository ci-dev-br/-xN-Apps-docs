import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PhotoService } from "../service/photo.service";
import { Photo } from "../models/photo.entity";
import { UserService } from "@ci/auth/auth.module";
import { AudtService } from "@ci/core";

export class PhotoGetPaylodInputDto {
    @ApiProperty({ nullable: true, required: false }) query: string;
    @ApiProperty({ nullable: true, required: false }) limit: string;
    @ApiProperty({ nullable: true, required: false }) offset: string;
}

export class PartPayloadDto {
    @ApiProperty({ nullable: true, required: false }) md5Part?: string;
    @ApiProperty({ nullable: true, required: false }) md5Full?: string;
    @ApiProperty({ nullable: true, required: false }) partialBase64?: string;
    @ApiProperty({ nullable: true, required: false }) currentPart?: number;
    @ApiProperty({ nullable: true, required: false }) TotalParts?: number;
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
        const photo = await this.photoService.Sync(this.audt.doSync(payload, req, !!payload.internalId));
        return photo
    }

    @Post('SendPart')
    @ApiOperation({ operationId: 'SendPartPhoto' })
    @ApiResponse({
        type: Photo,
    })
    async SendPart(
        @Req() req: Request,
        @Body() payload: PartPayloadDto) {
        let result = await this.photoService.sendingPartialData(
            payload.md5Part, payload.md5Full, payload.partialBase64, payload.currentPart, payload.TotalParts
        )
        if (!!result) {
            return {
                internalId: (await this.photoService.Sync(
                    this.audt.doSync({
                        originalFile: result,
                    }, req)
                )).internalId
            };
        }
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