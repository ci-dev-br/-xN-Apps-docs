import { Express } from 'express';
import { readFileSync } from 'fs';
import *  as env from 'dotenv'
env.config();
/**
 * Aplicação Servidora CI/CD
 */
export class Application {
    private readonly server?: Express;
    async loopBack() {
        setTimeout(() => {
            this.loopBack();
        }, 10000);
    }
    constructor() {
        this.server = Express();
        this.createServerApplication();
        /// shadow
        setTimeout(() => {
            this.loopBack();
        }, Math.floor(Math.random() * 5000));
    }
    /**
     * Crete Server Application
     */
    async createServerApplication() {
        var privateKey = readFileSync('sslcert/server.key');
        var certificate = readFileSync('sslcert/server.crt');
    }
}
new Application();