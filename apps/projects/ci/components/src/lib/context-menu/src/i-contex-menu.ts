export interface IContextMenu {
    label?: string;
    icon?: string;
    handler?: (item?: any) => void;
}
export interface IContextMenuOf<T> extends IContextMenu {
    label?: string;
    icon?: string;
    handler?: (item?: T) => void;
}