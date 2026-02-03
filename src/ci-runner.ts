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
        this.addEventLitener('message', message => {
            if (message.indexOf('[Domain Service iniciado]') > -1) {
                if (process.env.PUBLIC_GATEWAY_API)
                    this.adicionarVerificacaoRota(process.env.PUBLIC_GATEWAY_API);
                setTimeout(() => {
                    try {
                        const s = spawn('npm run apil', { cwd: __dirname + '/../apps', env: process.env,/*  detached: true, */ });

                        s.on('error', (error) => {
                            console.trace(error);
                        })

                        s.on('message', (message) => {
                            console.log(message);
                        })

                    } catch (error) {
                        console.trace(error);
                    }
                })
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
        this.addTask({
            command: 'git push --all azure',
            cwd: join(__dirname, '..'),
            name: 'Git Status',
            type: 'git'
        });
        this.addTask({
            command: 'git push --all PR',
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