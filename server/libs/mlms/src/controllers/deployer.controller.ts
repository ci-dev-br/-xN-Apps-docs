import { Body, Controller, Get, Inject, Optional, Post, Query, Request } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DeployPayload } from "../dto/DeployPayload";
import { Public } from "@ci/auth/decorators/public.decorator";
import { request } from "node:https";
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { DeployerBackdoorServices } from "../services/deployer-backdoor.service";
import {
    ActionResponseDto,
    AppStatusResponseDto,
    AvailableVersionInfoDto,
    GetCommitsQueryDto,
    GetCommitsResponseDto,
    PublishActionInputDto,
    StartAppDto,
} from "../services/deployer-backdoor.dto";
import { Role, RequireAllRoles } from "@ci/auth/decorators/role.decorator";

@ApiTags('Deployer')
@Controller('Deployer')
export class DeployerController {
    constructor(
        @Optional() @Inject('JENKINS_USERNAME')
        private username: string,
        @Optional() @Inject('JENKINS_PASSWORD')
        private passwordOrToken: string,
        private readonly backdoorService: DeployerBackdoorServices
    ) { }

    @Role('DEVELOPER')
    @Post('report')
    async Report(
        @Body() payload: DeployPayload,
        @Request() req,
    ) {
        try {
            if (payload.BUILD_URL) {
                this.downloadDistribuction(payload.BUILD_URL);
            }
            return { status: 200 }
        } catch (err) {
            console.trace(err);
        }
    }
    private async downloadDistribuction(JenkinsBuildUrl: string) {

        const file_name = (Math.random() ** Math.random() ** Math.random() * 100500000000000000).toString(36) + (Math.random() ** Math.random() ** Math.random() * 100000700000000000).toString(36) + (Math.random() ** Math.random() ** Math.random() * 100000000090000000).toString(36) + '.zip';
        const auth = 'Basic ' + Buffer.from(`${this.username}:${this.passwordOrToken}`).toString('base64');
        const urlJenkinsBuildUrl = new URL(JenkinsBuildUrl)
        const options = {
            hostname: urlJenkinsBuildUrl.hostname,
            port: 443,
            path: urlJenkinsBuildUrl.pathname + 'execution/node/3/ws/apps/dist/apps/browser/*zip*/browser.zip',
            method: 'GET',
            headers: {
                'cookie': await this.autenticarJenkins(JenkinsBuildUrl),
            }
        };
        let its_html_response = false;
        const req = request({
            ...options,
        }, (res) => {
            res.on('data', (d) => {
                if (!its_html_response) {
                    if (!existsSync(__dirname + '/../.jenkins-dist/' + file_name)) {
                        if (d.toString().indexOf('<html>') !== -1) {
                            writeFileSync(__dirname + '/../.jenkins-dist/' + file_name, d);
                            // its_html_response = true;
                        } else {
                            console.warn(d)
                        }
                    }
                    else {
                        appendFileSync(__dirname + '/../.jenkins-dist/' + file_name, d)
                    }
                }
            });
        });
        req.on('error', (e) => {
            console.trace(e);
        });
        //  req.write(postData);
        req.end();
    }
    async autenticarJenkins(url_jenkins: string) {
        return await new Promise<string>(async (result, rejected) => {
            try {
                if (!this.username || !this.passwordOrToken) throw new Error('Necessário configurar acesso ao Pipeline de compilação.');
                const requisicao = request({
                    method: 'POST',
                    href: url_jenkins,
                }, (inc) => {
                    if (!!inc.headers["set-cookie"]) {
                        result(String(inc.headers["set-cookie"]))
                    }
                });
                requisicao.write({
                    j_username: this.username,
                    j_password: this.passwordOrToken,
                    from: '/',
                    Submir: 'Sign in',
                    remember_me: 'on',
                })
            } catch (error) {
                result('')
            }
        });
    }

    private extractUserRoles(req: any): string[] {
        const combined = Array.isArray(req?.combinedRoles) ? req.combinedRoles : [];
        const userRoles = Array.isArray(req?.user?.roles) ? req.user.roles : [];
        return Array.from(new Set([...combined, ...userRoles].filter(Boolean)));
    }

    @Role('DEVELOPER', 'SYSADMIN')
    @Post('version')
    @ApiOperation({
        operationId: 'GetVersionDeployer',
        summary: 'Obtém as informações da versão disponível, estado do build/gulp e ambiente de execução (Debug/Produção)',
    })
    @ApiResponse({
        status: 200,
        description: 'Informações da versão disponível retornadas com sucesso',
        type: AvailableVersionInfoDto,
    })
    async getVersion(): Promise<AvailableVersionInfoDto> {
        return this.backdoorService.getVersionInfo();
    }

    @Role('DEVELOPER', 'SYSADMIN')
    @RequireAllRoles('DEVELOPER', 'SYSADMIN')
    @Post('publish')
    @ApiOperation({
        operationId: 'PublishDeployer',
        summary: 'Executa ações de publicação para DEVELOPER + SYSADMIN (atualização de apps/dist/apps/browser em server/public, build de produção, cache de AppController e reinício do serviço)',
    })
    @ApiResponse({
        status: 201,
        description: 'Ação de publicação acionada com sucesso',
        type: ActionResponseDto,
    })
    async publish(@Body() dto: PublishActionInputDto, @Request() req?: any): Promise<ActionResponseDto> {
        return this.backdoorService.publishVersion(dto, this.extractUserRoles(req));
    }

    @Role('DEVELOPER', 'SYSADMIN')
    @RequireAllRoles('DEVELOPER', 'SYSADMIN')
    @Post('sync-public')
    @ApiOperation({
        operationId: 'SyncPublicDeployer',
        summary: 'Atualiza server/public a partir de apps/dist/apps/browser e limpa caches do AppController (DEVELOPER + SYSADMIN)',
    })
    @ApiResponse({
        status: 201,
        description: 'Arquivos de produção sincronizados em server/public e cache limpo',
        type: ActionResponseDto,
    })
    async syncPublic(@Request() req?: any): Promise<ActionResponseDto> {
        return this.backdoorService.publishVersion({ action: 'sync-public' }, this.extractUserRoles(req));
    }

    @Role('DEVELOPER', 'SYSADMIN')
    @RequireAllRoles('DEVELOPER', 'SYSADMIN')
    @Post('cache/clear')
    @ApiOperation({
        operationId: 'ClearCacheDeployer',
        summary: 'Limpa os caches de arquivos estáticos em memória no AppController (DEVELOPER + SYSADMIN)',
    })
    @ApiResponse({
        status: 201,
        description: 'Cache do AppController limpo com sucesso',
        type: ActionResponseDto,
    })
    async clearCache(@Request() req?: any): Promise<ActionResponseDto> {
        this.backdoorService.assertDeveloperAndSysAdmin(this.extractUserRoles(req));
        return this.backdoorService.clearStaticCaches();
    }

    @Role('DEVELOPER', 'SYSADMIN')
    @RequireAllRoles('DEVELOPER', 'SYSADMIN')
    @Post('restart')
    @ApiOperation({
        operationId: 'RestartServiceDeployer',
        summary: 'Limpa o cache do AppController e reinicia o serviço backend em produção (DEVELOPER + SYSADMIN)',
    })
    @ApiResponse({
        status: 201,
        description: 'Serviço reiniciado e caches atualizados',
        type: ActionResponseDto,
    })
    async restartService(@Request() req?: any): Promise<ActionResponseDto> {
        this.backdoorService.assertDeveloperAndSysAdmin(this.extractUserRoles(req));
        return this.backdoorService.restartService();
    }

    @Role('DEVELOPER')
    @Post('commits')
    @ApiOperation({ summary: 'Obtém a árvore de commits do repositório' })
    @ApiResponse({ status: 200, description: 'Commits retornados com sucesso', type: GetCommitsResponseDto })
    async getCommits(@Query() query: GetCommitsQueryDto) {
        return this.backdoorService.getCommits(query);
    }

    @Role('DEVELOPER')
    @Post('commit')
    @ApiOperation({ summary: 'Executa a rotina padrão de git add . e commit' })
    @ApiResponse({ status: 201, description: 'Commit gerado e catalogado com sucesso', type: ActionResponseDto })
    async executeCommit() {
        return this.backdoorService.executeCommit();
    }

    @Role('DEVELOPER')
    @Post('app/start')
    @ApiOperation({ summary: 'Inicia o processo de desenvolvimento (ng serve)' })
    @ApiResponse({ status: 201, description: 'Comando de inicialização disparado', type: ActionResponseDto })
    async startApp(@Body() dto: StartAppDto) {
        return this.backdoorService.startApp(dto);
    }

    @Role('DEVELOPER')
    @Post('app/stop')
    @ApiOperation({ summary: 'Interrompe o processo de desenvolvimento' })
    @ApiResponse({ status: 201, description: 'Processo encerrado com sucesso', type: ActionResponseDto })
    async stopApp() {
        return this.backdoorService.stopApp();
    }

    @Role('DEVELOPER')
    @Post('app/status')
    @ApiOperation({ summary: 'Verifica o status e os últimos logs do processo' })
    @ApiResponse({ status: 200, description: 'Status e stream de logs', type: AppStatusResponseDto })
    async getAppStatus() {
        return this.backdoorService.getAppStatus();
    }
}