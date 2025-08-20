
export interface ICloudflareOption {
    /**
     * Cloudflare Token Tunnel
     * 
     */
    token?: string;
}

export class CloudflareIntegration {
    constructor(private readonly option: ICloudflareOption) { }
}