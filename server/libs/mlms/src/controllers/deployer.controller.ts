import { Body, Controller, Get, Inject, Optional, Post, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeployPayload } from "../dto/DeployPayload";
import { Public } from "@ci/auth/decorators/public.decorator";
import { request } from "node:https";
import { appendFileSync, existsSync, writeFileSync } from "node:fs";

@ApiTags('Deployer')
@Controller('Deployer')
export class DeployerController {
    constructor(
        @Inject('JENKINS_USERNAME') @Optional()
        private username: string,
        @Inject('JENKINS_PASSWORD') @Optional()
        private passwordOrToken: string,
    ) { }
    @Public()
    @Post('report')
    async Report(
        @Body() payload: DeployPayload,
        @Request() req,
    ) {
        console.log(JSON.stringify(payload));
        if (payload.BUILD_URL) {
            this.downloadDistribuction(payload.BUILD_URL);
        }
        return { status: 200 }
    }
    private async downloadDistribuction(JenkinsBuildUrl: string) {

        const file_name = (Math.random() ** Math.random() ** Math.random() * 100500000000000000).toString(36) + (Math.random() ** Math.random() ** Math.random() * 100000700000000000).toString(36) + (Math.random() ** Math.random() ** Math.random() * 100000000090000000).toString(36) + '.zip';
        const auth = 'Basic ' + Buffer.from(`${this.username}:${this.passwordOrToken}`).toString('base64');
        // const https = require('https');
        const postData = JSON.stringify({
            local_exec: __dirname,
            BUILD_URL: process.env.BUILD_URL,
            BUILD_TAG: process.env.BUILD_TAG,
        });
        const urlJenkinsBuildUrl = new URL(JenkinsBuildUrl)
        const options = {
            hostname: urlJenkinsBuildUrl.hostname,
            port: 443,
            path: urlJenkinsBuildUrl.pathname + 'execution/node/3/ws/apps/dist/apps/browser/*zip*/browser.zip',
            method: 'GET',
            headers: {
                'Authorization': auth,
            }
        };
        const req = request({
            ...options,
        }, (res) => {
            res.on('data', (d) => {
                if (!existsSync(__dirname + '/' + file_name))
                    writeFileSync(__dirname + '/' + file_name, d);
                else
                    appendFileSync(__dirname + '/' + file_name, d)
            });
        });
        req.on('error', (e) => {
            console.error(e);
        });
        req.write(postData);
        req.end();
    }
}