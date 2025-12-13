export interface IDataMessage {
    type: string;
    client: string;
    mac?: string;
    momento?: number;
    [key: string]: any;
}