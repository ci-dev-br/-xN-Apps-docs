export interface IDataMessage {
    type: string;
    client: string;
    mac?: string;
    momentum?: number;
    [key: string]: any;
}