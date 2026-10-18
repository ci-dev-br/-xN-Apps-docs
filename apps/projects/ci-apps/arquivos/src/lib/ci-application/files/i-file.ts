import { ReadDirectoryOutput } from "@ci/portal-api";

export type ArquivoViewMode =
    | 'grid'
    | 'extra-large'
    | 'large'
    | 'medium'
    | 'small'
    | 'list'
    | 'tiles'
    | 'content';

export type ArquivoFilterType = 'all' | 'folders' | 'files';

export type ArquivoSortField = 'name' | 'tipo' | 'extensao' | 'itensCount' | 'caminho';

export interface IBreadcrumbSegment {
    name: string;
    path: string;
}

export interface IQuickLocation {
    label: string;
    path: string;
    icon: string;
    pinned?: boolean;
}

export interface IExplorerTab {
    id: string;
    title: string;
    path: string;
}

export interface IArquivo {
    iconType?: string;
    name?: string;
    icon?: string;
    info?: ReadDirectoryOutput & {
        children?: (ReadDirectoryOutput & { children?: any[] })[];
        isCharacterDevice?: boolean;
    };
    isDirectory?: boolean;
    isFile?: boolean;
    tipo?: string;
    extensao?: string;
    caminho?: string;
    itensCount?: number | string;
    atributos?: string;
}