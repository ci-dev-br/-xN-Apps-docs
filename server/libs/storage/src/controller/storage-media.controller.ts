import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { StorageAsset } from "../models/storage-asset.entity";
import { StorageMediaService } from "../service/storage-media.service";
import {
    CompleteUploadStorageMediaInputDto,
    GetAssetInfoStorageMediaInputDto,
    InitUploadStorageMediaInputDto,
    InitUploadStorageMediaOutputDto,
    ObterListaStorageAsset,
    ReadChunkStorageMediaInputDto,
    ReadChunkStorageMediaOutputDto,
    SyncPayloadDaoStorageAsset,
    UploadChunkStorageMediaInputDto,
    UploadChunkStorageMediaOutputDto,
} from "./dto/storage-media.dto";

@Role('USER')
@ApiTags('StorageMedia')
@Controller('StorageMedia')
export class StorageMediaController extends ControllerDaoBase<StorageMediaService, StorageAsset> {
    constructor(private readonly storageMediaService: StorageMediaService) {
        super(storageMediaService);
    }

    @Post('Sync')
    @ApiResponse({ type: StorageAsset })
    @ApiOperation({ operationId: 'SyncStorageMedia' })
    override async Sync(@Body() body: SyncPayloadDaoStorageAsset, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: StorageAsset })
    @ApiOperation({ operationId: 'GetByInternalIdStorageMedia' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: StorageAsset, isArray: true })
    @ApiOperation({ operationId: 'GetListStorageMedia' })
    override async GetList(@Body() input: ObterListaStorageAsset, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: StorageAsset })
    @ApiOperation({ operationId: 'DeleteStorageMedia' })
    override async Delete(@Body() body: StorageAsset, @Req() req?: any) {
        return await super.Delete(body, req);
    }

    @Post('InitUpload')
    @ApiResponse({ type: InitUploadStorageMediaOutputDto })
    @ApiOperation({ operationId: 'InitUploadStorageMedia' })
    async InitUpload(@Body() input: InitUploadStorageMediaInputDto, @Req() req?: any) {
        return await this.storageMediaService.initUpload(input, req);
    }

    @Post('UploadChunk')
    @ApiResponse({ type: UploadChunkStorageMediaOutputDto })
    @ApiOperation({ operationId: 'UploadChunkStorageMedia' })
    async UploadChunk(@Body() input: UploadChunkStorageMediaInputDto) {
        return await this.storageMediaService.uploadChunk(input);
    }

    @Post('CompleteUpload')
    @ApiResponse({ type: StorageAsset })
    @ApiOperation({ operationId: 'CompleteUploadStorageMedia' })
    async CompleteUpload(@Body() input: CompleteUploadStorageMediaInputDto, @Req() req?: any) {
        return await this.storageMediaService.completeUpload(input, req);
    }

    @Post('GetAssetInfo')
    @ApiResponse({ type: StorageAsset })
    @ApiOperation({ operationId: 'GetAssetInfoStorageMedia' })
    async GetAssetInfo(@Body() input: GetAssetInfoStorageMediaInputDto, @Req() req?: any) {
        return await this.storageMediaService.getAssetInfo(input.assetId, req);
    }

    @Post('ReadChunk')
    @ApiResponse({ type: ReadChunkStorageMediaOutputDto })
    @ApiOperation({ operationId: 'ReadChunkStorageMedia' })
    async ReadChunk(@Body() input: ReadChunkStorageMediaInputDto, @Req() req?: any) {
        return await this.storageMediaService.readChunk(input, req);
    }
}
