import { execSync } from "node:child_process";

export interface ICloudflareOption {
    /**
     * Cloudflare Token Tunnel
     * 
     */
    token?: string;
}
export class CloudflareIntegration {
    constructor(private readonly option: ICloudflareOption) {
        setTimeout(async () => this.grantStating(), 260);
    }
    async grantStating() {
        try {
            execSync('cloudflared service uninstall');
        } catch (error) {
            console.trace(error);
        }
        try {
            execSync(`cloudflared service install ${this.option.token}`);
        } catch (error) {
            console.trace(error);
        }
    }
}