import { Role } from "@ci/auth/decorators/role.decorator";
import { Public } from "@ci/auth/decorators/public.decorator";
import { ControllerDaoBase } from "@ci/manager";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    DeleteWorkspaceIconInputDto,
    GetByInternalIdInputDto,
    IconGetInput,
    IconManifestResponseDto,
    LinkIconTargetInputDto,
    ObterListaIcon,
    ObterListaIconPack,
    SaveWorkspaceIconInputDto,
    SaveWorkspacePackInputDto,
    SyncPayloadDaoIcon,
    SyncPayloadDaoIconPack,
    WorkspaceIconItemDto,
    WorkspaceIconPackDto,
    WorkspacePacksResponseDto,
} from "./dto/icon.dto";
import { Icon } from "../models/icon.entity";
import { IconPack } from "../models/icon-pack.entity";
import { IconCrudService, IconPackCrudService, IconsServices } from "../services/icons.service";

@Role('MASTER', 'ADMIN', 'DEVELOPER')
@ApiTags('Icon')
@Controller('Icon')
export class IconController extends ControllerDaoBase<IconCrudService, Icon> {
    constructor(service: IconCrudService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SyncPayloadDaoIcon })
    @ApiOperation({ operationId: 'SyncIcon' })
    override async Sync(@Body() body: SyncPayloadDaoIcon, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Icon })
    @ApiOperation({ operationId: 'GetByInternalIdIcon' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SyncPayloadDaoIcon })
    @ApiOperation({ operationId: 'GetListIcon' })
    override async GetList(@Body() input: ObterListaIcon, @Req() req?: any) {
        return super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Icon })
    @ApiOperation({ operationId: 'DeleteIcon' })
    override async Delete(@Body() body: Icon, @Req() req?: any) {
        return await super.Delete(body, req);
    }
}

@Role('MASTER', 'ADMIN', 'DEVELOPER')
@ApiTags('IconPack')
@Controller('IconPack')
export class IconPackController extends ControllerDaoBase<IconPackCrudService, IconPack> {
    constructor(service: IconPackCrudService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SyncPayloadDaoIconPack })
    @ApiOperation({ operationId: 'SyncIconPack' })
    override async Sync(@Body() body: SyncPayloadDaoIconPack, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: IconPack })
    @ApiOperation({ operationId: 'GetByInternalIdIconPack' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SyncPayloadDaoIconPack })
    @ApiOperation({ operationId: 'GetListIconPack' })
    override async GetList(@Body() input: ObterListaIconPack, @Req() req?: any) {
        return super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: IconPack })
    @ApiOperation({ operationId: 'DeleteIconPack' })
    override async Delete(@Body() body: IconPack, @Req() req?: any) {
        return await super.Delete(body, req);
    }
}

@ApiTags('Icons')
@Controller('Icons')
export class IconsController {
    constructor(
        private readonly iconsService: IconsServices,
    ) { }

    @Role('MASTER', 'ADMIN', 'DEVELOPER')
    @Post('Registry')
    @ApiOperation({ operationId: 'RegistryIcons' })
    @ApiResponse({ type: WorkspaceIconItemDto })
    async registrarNovoIcone(@Body() input: SaveWorkspaceIconInputDto) {
        return await this.iconsService.saveWorkspaceIcon(input);
    }

    @Role('USER', 'MASTER', 'ADMIN', 'DEVELOPER')
    @Post('Get')
    @ApiOperation({ operationId: 'GetIcons' })
    @ApiResponse({ type: Icon, isArray: true })
    async get(@Body() input?: IconGetInput) {
        const [items] = await this.iconsService.obterIcones(input);
        return items;
    }

    @Role('USER', 'MASTER', 'ADMIN', 'DEVELOPER')
    @Post('WorkspacePacks')
    @ApiOperation({ operationId: 'GetWorkspacePacksIcons' })
    @ApiResponse({ type: WorkspacePacksResponseDto })
    async getWorkspacePacks() {
        return await this.iconsService.getWorkspacePacks();
    }

    @Role('MASTER', 'ADMIN', 'DEVELOPER')
    @Post('SavePack')
    @ApiOperation({ operationId: 'SavePackIcons' })
    @ApiResponse({ type: WorkspaceIconPackDto })
    async savePack(@Body() input: SaveWorkspacePackInputDto) {
        return await this.iconsService.saveWorkspacePack(input);
    }

    @Role('MASTER', 'ADMIN', 'DEVELOPER')
    @Post('SaveIcon')
    @ApiOperation({ operationId: 'SaveIconIcons' })
    @ApiResponse({ type: WorkspaceIconItemDto })
    async saveIcon(@Body() input: SaveWorkspaceIconInputDto) {
        return await this.iconsService.saveWorkspaceIcon(input);
    }

    @Role('MASTER', 'ADMIN', 'DEVELOPER')
    @Post('DeleteIcon')
    @ApiOperation({ operationId: 'DeleteIconIcons' })
    async deleteIcon(@Body() input: DeleteWorkspaceIconInputDto) {
        return await this.iconsService.deleteWorkspaceIcon(input);
    }

    @Role('MASTER', 'ADMIN', 'DEVELOPER')
    @Post('LinkTargets')
    @ApiOperation({ operationId: 'LinkTargetsIcons' })
    @ApiResponse({ type: WorkspaceIconItemDto })
    async linkTargets(@Body() input: LinkIconTargetInputDto) {
        return await this.iconsService.linkTargets(input);
    }

    @Public()
    @Post('Manifest')
    @ApiOperation({ operationId: 'GetManifestIcons' })
    @ApiResponse({ type: IconManifestResponseDto })
    async getManifest() {
        return await this.iconsService.getRuntimeManifest();
    }
}
