import { Injectable, Optional } from "@nestjs/common";
import { FilePermissionService } from "../service/file-permission.service";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { FileDto } from "../controller/dto/file-dto";
import { isAbsolute, join } from 'path';
import { GitService } from "../service/git.service";

@Injectable()
export class FileExplorerService {
    constructor(
        private readonly gitService: GitService,
        @Optional() private readonly filePermissions: FilePermissionService,
    ) { }

    /**
     * Resolve o caminho solicitado mantendo o prefixo relativo ('./' ou '../')
     * e permitindo resolver pastas da raiz do workspace (ex: './apps' -> '../apps')
     * caso não existam no cwd ('/server') mas existam no diretório pai ('..').
     */
    private resolveExistingPath(rawPath?: string): string {
        if (!rawPath || !rawPath.trim()) return './';
        let normalized = rawPath.trim().replace(/\\/g, '/');
        if (!isAbsolute(normalized) && !normalized.startsWith('./') && !normalized.startsWith('../') && !normalized.startsWith('/')) {
            normalized = `./${normalized}`;
        }
        if (!existsSync(normalized) && normalized.startsWith('./')) {
            const parentCandidate = `../${normalized.substring(2)}`;
            if (existsSync(parentCandidate)) {
                return parentCandidate;
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
}