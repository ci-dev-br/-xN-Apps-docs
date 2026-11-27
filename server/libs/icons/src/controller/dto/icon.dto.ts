import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Icon } from "../../models/icon.entity";
import { IconPack } from "../../models/icon-pack.entity";

export class GetByInternalIdInputDto {
    @ApiProperty({ required: true, nullable: false })
    internalId?: string;
}

export class SyncPayloadDaoIcon extends SyncPayloadDao<Icon> {
    @ApiProperty({ type: Icon })
    override data?: Icon;
}

export class ObterListaIcon {
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: Icon })
    where?: FindOptionsWhere<Icon>[] | FindOptionsWhere<Icon>;
    @ApiProperty({ required: false, nullable: true, type: Icon })
    filter?: Partial<Icon>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}

export class SyncPayloadDaoIconPack extends SyncPayloadDao<IconPack> {
    @ApiProperty({ type: IconPack })
    override data?: IconPack;
}

export class ObterListaIconPack {
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: IconPack })
    where?: FindOptionsWhere<IconPack>[] | FindOptionsWhere<IconPack>;
    @ApiProperty({ required: false, nullable: true, type: IconPack })
    filter?: Partial<IconPack>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}

export class IconGetInput {
    @ApiProperty({ nullable: true, required: false, isArray: true, type: String })
    icons?: string[];
    @ApiProperty({ nullable: true, required: false })
    packCode?: string;
    @ApiProperty({ nullable: true, required: false })
    usageType?: string;
}

export class WorkspaceIconItemDto {
    @ApiProperty({ required: false })
    internalId?: string;
    @ApiProperty({ required: true })
    code!: string;
    @ApiProperty({ required: false })
    name?: string;
    @ApiProperty({ required: false })
    description?: string;
    @ApiProperty({ required: true })
    packCode!: string;
    @ApiProperty({ required: false })
    assetPath?: string;
    @ApiProperty({ required: false })
    svgContent?: string;
    @ApiProperty({ required: false })
    viewBox?: string;
    @ApiProperty({ required: false })
    category?: string;
    @ApiProperty({ required: false })
    usageType?: string;
    @ApiProperty({ required: false, isArray: true, type: String })
    tags?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedApps?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedActions?: string[];
    @ApiProperty({ required: false })
    fileSize?: number;
    @ApiProperty({ required: false })
    updatedAt?: string;
    @ApiProperty({ required: false })
    hasPng?: boolean;
    @ApiProperty({ required: false })
    source?: 'workspace' | 'database' | 'both';
}

export class WorkspaceIconPackDto {
    @ApiProperty({ required: false })
    internalId?: string;
    @ApiProperty({ required: true })
    code!: string;
    @ApiProperty({ required: true })
    name!: string;
    @ApiProperty({ required: false })
    description?: string;
    @ApiProperty({ required: false })
    version?: string;
    @ApiProperty({ required: false })
    basePath?: string;
    @ApiProperty({ required: false })
    isActive?: boolean;
    @ApiProperty({ required: false })
    isDefault?: boolean;
    @ApiProperty({ required: false, isArray: true, type: String })
    targetApps?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedActions?: string[];
    @ApiProperty({ required: false })
    source?: 'workspace' | 'database' | 'both';
    @ApiProperty({ required: false })
    iconCount?: number;
    @ApiProperty({ required: false, isArray: true, type: WorkspaceIconItemDto })
    icons?: WorkspaceIconItemDto[];
}

export class WorkspacePacksResponseDto {
    @ApiProperty({ isArray: true, type: WorkspaceIconPackDto })
    packs!: WorkspaceIconPackDto[];
    @ApiProperty({ required: false })
    appsIconsRoot?: string;
}

export class SaveWorkspacePackInputDto {
    @ApiProperty({ required: true })
    code!: string;
    @ApiProperty({ required: false })
    previousCode?: string;
    @ApiProperty({ required: false })
    name?: string;
    @ApiProperty({ required: false })
    description?: string;
    @ApiProperty({ required: false })
    version?: string;
    @ApiProperty({ required: false })
    isActive?: boolean;
    @ApiProperty({ required: false })
    isDefault?: boolean;
    @ApiProperty({ required: false, isArray: true, type: String })
    targetApps?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedActions?: string[];
    @ApiProperty({ required: false })
    writeToAssets?: boolean;
}

export class SaveWorkspaceIconInputDto {
    @ApiProperty({ required: true })
    packCode!: string;
    @ApiProperty({ required: true })
    code!: string;
    @ApiProperty({ required: false })
    previousCode?: string;
    @ApiProperty({ required: false })
    name?: string;
    @ApiProperty({ required: false })
    description?: string;
    @ApiProperty({ required: true })
    svgContent!: string;
    @ApiProperty({ required: false })
    viewBox?: string;
    @ApiProperty({ required: false })
    category?: string;
    @ApiProperty({ required: false })
    usageType?: string;
    @ApiProperty({ required: false, isArray: true, type: String })
    tags?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedApps?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedActions?: string[];
    @ApiProperty({ required: false })
    writeToAssets?: boolean;
    @ApiProperty({ required: false })
    updateApplicationEntity?: boolean;
}

export class DeleteWorkspaceIconInputDto {
    @ApiProperty({ required: true })
    packCode!: string;
    @ApiProperty({ required: true })
    code!: string;
    @ApiProperty({ required: false })
    deleteAssetFile?: boolean;
}

export class LinkIconTargetInputDto {
    @ApiProperty({ required: true })
    packCode!: string;
    @ApiProperty({ required: true })
    code!: string;
    @ApiProperty({ required: false })
    assetPath?: string;
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedApps?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedActions?: string[];
    @ApiProperty({ required: false })
    updateApplicationEntity?: boolean;
}

export class IconManifestEntryDto {
    @ApiProperty({ required: false })
    url?: string;
    @ApiProperty({ required: false })
    svgContent?: string;
    @ApiProperty({ required: false })
    packCode?: string;
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedApps?: string[];
    @ApiProperty({ required: false, isArray: true, type: String })
    linkedActions?: string[];
}

export class IconManifestResponseDto {
    @ApiProperty({ required: false })
    icons!: Record<string, IconManifestEntryDto>;
    @ApiProperty({ required: false, isArray: true, type: String })
    activePacks?: string[];
}
