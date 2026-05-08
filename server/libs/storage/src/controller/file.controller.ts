import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@ci/auth/auth.module";
import { AudtService } from "@ci/core";
import { Role } from "@ci/auth/decorators/role.decorator";
import { FileService } from "../service/file.service";
import { File } from "../models/file.entity";
export class FileGetPaylodInputDto {
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
@Role('USER')
@ApiTags('File')
@Controller('File')
export class FileController {
    constructor(
        private readonly photoService: FileService,
        private readonly userService: UserService,
        private readonly audt: AudtService,
    ) { }
    @Post('Sync')
    @ApiOperation({ operationId: 'SyncFile' })
    @ApiResponse({
        type: File,
    })
    async Sync(
        @Req() req: Request,
        @Body() payload: File) {
        try {

            const photo = await this.photoService.Sync(this.audt.doSync(payload, req, !!payload.internalId));
            return photo
        } catch (err) {
            console.trace(err)
        }
    }
    /* @Post('SendPart')
    @ApiOperation({ operationId: 'SendPartFile' })
    @ApiResponse({
        type: File,
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
    } */
    @Post('Get')
    @ApiOperation({ operationId: 'GetFile' })
    @ApiResponse({
        type: File,
        isArray: true
    })
    async Get(
        @Req() req: Request,
        @Body() payload: FileGetPaylodInputDto
    ) {
        try {
            return await this.photoService.Get(payload.query);
        } catch (err) {
            console.trace(err)
        }
    }
}