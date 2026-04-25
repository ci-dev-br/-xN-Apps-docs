import { Body, Controller, Get, Post, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeployPayload } from "../dto/DeployPayload";
import { Public } from "@ci/auth/decorators/public.decorator";
import { Repository } from "typeorm";
import { request } from "node:https";
import { appendFileSync, existsSync, writeFileSync } from "node:fs";

@ApiTags('Deployer')
@Controller('Deployer')
export class DeployerController {
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

        const file_name = (Math.random() ** Math.random() ** Math.random() * 100000000000000000).toString(36) + (Math.random() ** Math.random() ** Math.random() * 100000000000000000).toString(36) + (Math.random() ** Math.random() ** Math.random() * 100000000000000000).toString(36) + '.zip';

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
            method: 'GET'
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