import { BadRequestException, Injectable, Optional } from "@nestjs/common";
import { FilePermissionService } from "../service/file-permission.service";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { FileDto } from "../controller/dto/file-dto";
import { isAbsolute, join } from 'path';
import { GitService } from "../service/git.service";
import { MailService } from "@ci/notification/services/mail.service";
import { templateHtml } from "@ci/core/template/load-template.fn";
import {
    AuthorizeFilePermissionInputDto,
    AuthorizeFilePermissionOutputDto,
    MyFilePermissionsOutputDto,
    RequestFilePermissionInputDto,
    RequestFilePermissionOutputDto,
} from "../controller/dto/file-permission.dto";

@Injectable()
export class FileExplorerService {
    constructor(
        private readonly gitService: GitService,
        @Optional() private readonly filePermissions?: FilePermissionService,
        @Optional() private readonly mailService?: MailService,
    ) { }

    /**
     * Resolve o caminho solicitado mantendo o prefixo relativo ('./' ou '../')
     * e permitindo resolver pastas da raiz do workspace (ex: './apps' -> '../apps')
     * caso não existam no cwd ('/server') mas existam no diretório pai ('..').
     */
    private resolveExistingPath(rawPath?: string): string {
        if (!rawPath || !rawPath.trim()) return './';
        let normalized = rawPath.trim().replace(/\\/g, '/');

        // Se for no formato /c:/... normaliza para c:/...
        if (/^\/[a-zA-Z]:/.test(normalized)) {
            normalized = normalized.substring(1);
        } else if (normalized.startsWith('/') && !/^[a-zA-Z]:/.test(normalized)) {
            normalized = normalized.replace(/^\/+/, '');
        }

        if (isAbsolute(normalized) && existsSync(normalized)) {
            return normalized;
        }

        if (!normalized.startsWith('./') && !normalized.startsWith('../')) {
            normalized = `./${normalized}`;
        }

        if (existsSync(normalized)) {
            return normalized;
        }

        if (normalized.startsWith('./')) {
            const parentCandidate = `../${normalized.substring(2)}`;
            if (existsSync(parentCandidate)) {
                return parentCandidate;
            }
            if (normalized.startsWith('./projects/')) {
                const appsCandidate = `../apps/${normalized.substring(2)}`;
                if (existsSync(appsCandidate)) {
                    return appsCandidate;
                }
            }
        }
        return normalized;
    }

    private formatChildPath(dirPath: string, childName: string): string {
        const joined = join(dirPath, childName).replace(/\\/g, '/');
        if (!isAbsolute(joined) && !joined.startsWith('./') && !joined.startsWith('../') && !joined.startsWith('/')) {
            return `./${joined}`;
        }
        return joined;
    }

    private extractOriginUrl(explicitOrigin?: string, request?: any): string {
        if (explicitOrigin && explicitOrigin.trim()) {
            return explicitOrigin.trim().replace(/\/+$/, '');
        }
        const reqOrigin = request?.headers?.origin;
        if (reqOrigin && typeof reqOrigin === 'string') {
            return reqOrigin.trim().replace(/\/+$/, '');
        }
        const referer = request?.headers?.referer;
        if (referer && typeof referer === 'string') {
            try {
                return new URL(referer).origin.replace(/\/+$/, '');
            } catch { }
        }
        return 'https://apps.ci.dev.br';
    }

    async readDirectory(input: FileDto, request: Request, maxDepth: number = 2) {
        try {
            const targetPath = this.resolveExistingPath(input?.path);
            if (this.filePermissions) {
                if (!(await this.filePermissions.grant(targetPath, request))) {
                    return null;
                }
            }

            // Inicia a leitura no nível 1
            return this.getDirectoryContents(targetPath, 1, maxDepth);
        } catch (error) {
            console.trace(error);
            return null;
        }
    }

    /**
     * Método auxiliar recursivo para ler diretórios até a profundidade máxima estipulada
     */
    private getDirectoryContents(dirPath: string, currentDepth: number, maxDepth: number) {
        if (currentDepth > maxDepth) {
            return [];
        }

        let items: any[] = [];
        try {
            items = readdirSync(dirPath, { withFileTypes: true });
        } catch {
            return [];
        }

        return items
            .filter(f => !f.name.startsWith('.') && !f.name.startsWith('$'))
            .map(dirent => {
                const isDirectory = dirent.isDirectory();
                const itemPath = this.formatChildPath(dirPath, dirent.name);

                return {
                    ...dirent,
                    name: dirent.name,
                    path: itemPath,
                    isCharacterDevice: dirent.isCharacterDevice(),
                    isFile: dirent.isFile(),
                    isDirectory: isDirectory,
                    isSocket: dirent.isSocket(),
                    isFIFO: dirent.isFIFO(),
                    isSymbolicLink: dirent.isSymbolicLink(),
                    // Se for um diretório e não tiver atingido o limite, busca as subpastas
                    children: isDirectory && currentDepth < maxDepth
                        ? this.getDirectoryContents(itemPath, currentDepth + 1, maxDepth)
                        : [],
                };
            });
    }

    async readFile(input: FileDto, request: Request) {
        try {
            const targetPath = this.resolveExistingPath(input?.path);
            if (!!this.filePermissions) {
                if (await this.filePermissions.grant(targetPath, request)) {

                } else {
                    throw new Error('Negado por Política de Acesso.')
                }
            }
            if (!input.data) {
                let readed = readFileSync(targetPath, {
                    encoding: input.encoding as any || 'utf-8'
                });
                input.data = readed.toString();
            } else if (typeof input.data === 'string') {
                // TODO: implementar controle de versão em cima das alterações realizadas via API.
                console.log('writing file... ');
                writeFileSync(targetPath,
                    input.data, { encoding: 'utf-8' }
                )
            }
            input.path = targetPath;
            input.gitStatus = await this.gitService.status(input, request);
            return input;
        } catch (error) {
            console.trace(error);
            return {
                status: 500,
                cause: error
            }
        }
    }

    /**
     * Registra uma solicitação de permissão para acessar uma pasta e envia e-mail
     * a partir do template de e-mail para todos os usuários com role SYSADMIN
     * contendo o link para autorizar o acesso à pasta.
     */
    async requestPermission(
        input: RequestFilePermissionInputDto,
        request: any,
    ): Promise<RequestFilePermissionOutputDto> {
        if (!this.filePermissions) {
            throw new BadRequestException('Serviço de permissões de arquivo não disponível.');
        }

        const targetPath = this.resolveExistingPath(input?.path);
        const result = await this.filePermissions.createPermissionRequest(
            targetPath,
            input?.reason,
            request,
        );

        if (result.alreadyAuthorized) {
            return {
                requested: false,
                alreadyAuthorized: true,
                path: targetPath,
                status: 'GRANTED',
                message: `Você já possui permissão autorizada para a pasta "${targetPath}".`,
            };
        }

        const permission = result.permission!;
        const baseUrl = this.extractOriginUrl(input?.originUrl, request);
        const authorizeLink = `${baseUrl}/autorizar-pasta/${encodeURIComponent(permission.requestToken || '')}`;

        const sysadmins = await this.filePermissions.findSysAdminUsers();
        const recipients = sysadmins.filter(u => Boolean(u.email && u.email.trim().length > 0));

        const requesterName =
            permission.requestedByName ||
            request?.user?.fullName ||
            request?.user?.surname ||
            request?.user?.username ||
            request?.user?.email ||
            'Usuário';
        const requesterEmail = permission.requestedByEmail || request?.user?.email || 'Não informado';
        const dataSolicitacao = new Date().toLocaleString('pt-BR');
        const ano = String(new Date().getFullYear());

        let emailsSent = 0;
        if (this.mailService && recipients.length > 0) {
            for (const sysadmin of recipients) {
                const sysadminName = sysadmin.fullName || sysadmin.surname || sysadmin.username || sysadmin.email || 'SysAdmin';
                const template_html = templateHtml('file-permission-request-template', {
                    logo_base64: '',
                    sysadmin_nome: sysadminName,
                    solicitante_nome: requesterName,
                    solicitante_email: requesterEmail,
                    pasta_caminho: targetPath,
                    motivo: permission.reason || 'Acesso operacional via File Explorer / Terminal SYSADMIN.',
                    request_token: permission.requestToken || '',
                    link_autorizar_pasta: authorizeLink,
                    data_solicitacao: dataSolicitacao,
                    mail_sender_status: 'Notificação de segurança enviada pelo File Explorer Service — apps.ci.dev.br',
                    ano,
                    footer_assinatura: 'ci.dev.br',
                    footer_message: 'Apps, seus aplicativos',
                });

                try {
                    await this.mailService.requestSendMessageToMail({
                        to: sysadmin.email!.trim(),
                        subject: `Solicitação de acesso à pasta "${targetPath}" — apps.ci.dev.br`,
                        template_html,
                        message_text: `Olá ${sysadminName}, o usuário ${requesterName} (${requesterEmail}) solicitou permissão para acessar a pasta "${targetPath}". Autorize em: ${authorizeLink}`,
                    });
                    emailsSent++;
                } catch (mailErr: any) {
                    console.warn('[FileExplorerService] Falha ao enviar e-mail para SYSADMIN:', mailErr?.message || mailErr);
                }
            }
        }

        return {
            requested: true,
            alreadyAuthorized: false,
            path: targetPath,
            status: permission.status || 'PENDING',
            requestToken: permission.requestToken,
            emailsSent,
            sysadminCount: recipients.length,
            authorizeLink,
            message: recipients.length > 0
                ? `Solicitação registrada e enviada por e-mail para ${emailsSent} usuário(s) SYSADMIN.`
                : 'Solicitação registrada, porém nenhum usuário SYSADMIN com e-mail cadastrado foi encontrado.',
        };
    }

    async authorizePermission(
        input: AuthorizeFilePermissionInputDto,
        request: any,
    ): Promise<AuthorizeFilePermissionOutputDto> {
        if (!this.filePermissions) {
            throw new BadRequestException('Serviço de permissões de arquivo não disponível.');
        }
        return await this.filePermissions.authorizeByTokenOrId(input, request);
    }

    async getPermissionRequest(token: string) {
        if (!this.filePermissions) {
            throw new BadRequestException('Serviço de permissões de arquivo não disponível.');
        }
        return await this.filePermissions.getPermissionRequestByToken(token);
    }

    async myPermissions(request: any): Promise<MyFilePermissionsOutputDto> {
        if (!this.filePermissions) {
            return {
                authorizedPaths: [],
                permissions: [],
                pendingRequests: [],
            };
        }
        return await this.filePermissions.listMyPermissions(request);
    }
}
