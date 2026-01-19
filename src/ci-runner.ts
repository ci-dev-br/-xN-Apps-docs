require('dotenv').config();
import { join } from "node:path";
import { RunnerX } from "./comum/runner-x";
import { spawn, spawnSync } from "node:child_process";
export class CiRunner extends RunnerX {
    constructor() {
        super();
        this.addTask({
            command: 'node node_modules/@nestjs/cli/bin/nest.js start --watch --debug',
            cwd: join(__dirname, '..', 'server'),
            name: 'Apps',
            type: 'nest'
        });
        this.GitStatus();
        this.GitAdd();
        this.GitPull();
        this.GitPush();
        this.addEventLitener('message', message => {
            if (message.indexOf('[Domain Service iniciado]') > -1) {
                if (process.env.PUBLIC_GATEWAY_API)
                    this.adicionarVerificacaoRota(process.env.PUBLIC_GATEWAY_API);
            } else if (message.indexOf('Changes to be committed:') > -1) {
                (() => {
                    console.info('[Initialize committer]');
                    try {
                        this.ignoreTasks('git');
                        const p = spawn('node commiter', {
                            cwd: join(__dirname, '..'),
                            env: process.env,
                            shell: true
                        });
                        p.stderr.on('data', (chunk) => {
                            console.log(chunk);
                        })
                        p.stdout.on('end', (chunk) => {
                            console.log(chunk);
                            this.resumeTasks('git');
                        })
                        p.stderr.on('error', (chunk) => {
                            console.log(chunk);
                        })
                        p.stderr.on('readable', (chunk) => {
                            console.log(chunk);
                        })
                        p.stderr.on('resume', (chunk) => {
                            console.log(chunk);
                        })
                    } catch (error) {

                    }
                })();
            }
        });
    }
    private GitAdd() {
        this.addTask({
            command: 'git add .',
            cwd: join(__dirname, '..'),
            name: 'Git add',
            type: 'git'
        });
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