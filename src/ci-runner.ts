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
        this.addEventLitener('message', message => {
            if (message.indexOf('[Domain Service iniciado]') > -1) {
                if (process.env.PUBLIC_GATEWAY_API)
                    this.adicionarVerificacaoRota(process.env.PUBLIC_GATEWAY_API);
            }
        })
    }
}