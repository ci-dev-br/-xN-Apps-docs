require('dotenv').config();
import { join } from "node:path";
import { RunnerX } from "./comum/runner-x";
export class CiRunner extends RunnerX {
    constructor() {
        super();
        this.addTask({
            command: 'node node_modules/@nestjs/cli/bin/nest.js start --watch --debug',
            cwd: join(__dirname, '..', 'server'),
            name: 'Apps',
            type: 'nest'
        });
        setInterval(() =>
            this.GitAdd()
            , 60 * 1000 * 5);
        this.addEventLitener('message', message => {
            if (message.indexOf('[Domain Service iniciado]') > -1) {
                if (process.env.PUBLIC_GATEWAY_API)
                    this.adicionarVerificacaoRota(process.env.PUBLIC_GATEWAY_API);
            }
            if (message.indexOf('Changes to be committed:') > -1) {
                console.info('needs commit...');
                this.addTask({
                    command: 'node commiter',
                    cwd: join(__dirname, '..'),
                    name: 'IA Commit',
                    type: 'ci'
                });
            }
        });
    }
    private GitAdd() {
        this.GitPull();
        this.addTask({
            command: 'git add .',
            cwd: join(__dirname, '..'),
            name: 'Git add',
            type: 'git'
        });
        this.GitStatus();
    }
    private GitPull() {
        this.addTask({
            command: 'git pull --all',
            cwd: join(__dirname, '..'),
            name: 'Git Status',
            type: 'git'
        });
    }
    private GitPush() {
        this.addTask({
            command: 'git push --all',
            cwd: join(__dirname, '..'),
            name: 'Git Status',
            type: 'git'
        });
    }
    private GitStatus() {
        this.addTask({
            command: 'git status',
            cwd: join(__dirname, '..'),
            name: 'Git Status',
            type: 'git'
        });
    }
}