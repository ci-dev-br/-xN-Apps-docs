export interface IAutentication {
    readonly identify?: string;
    readonly confirmation?: string;
    readonly roles?: string[];
    readonly tenants?: string[];
}