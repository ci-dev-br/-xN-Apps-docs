const { spawn } = require('child_process');

class Process {
    constructor() { }
}
class ServiceBase {
    _processes = [];
    addProcess(name, command, args) {

    }
    showStatus() {
        let out =
            `[aplicação em execução]\n{ s:${status_service} }\n`;
        if (cliente_message)
            out += `[ client ]: \n${String(cliente_message).trim()}\n`;
        if (message_service)
            out += `[ service ]: \n${String(message_service).trim()}\n`;
        if (out != last) {
            last = out;
            console.clear();
            console.info(out);
        }
        setTimeout(() => this.showStatus(), 900);
    }
}
class CiDevAppsSerices extends ServiceBase {
    constructor() {
        this.addProcess('[service]', 'node', ['./node_modules/@nestjs/cli/bin/nest', 'start', '--watch', '--debug'])
    }
}
//  /**
//   * Cliente da Aplicação
//   */
//  const cliente_processo = null;
//  //  spawn('node', ['./node_modules/@angular/cli/bin/ng.js', 'serve'], { cwd: __dirname + '/../client' })
//  //     .on('data', m => console.log(m))
//  //     .on('error', m => console.log(m))
//  //     .on('message', m => console.log(m))
//  //     ;
//  let processos = [];
//  let cliente_status = 0;
//  let cliente_message = null;
//  cliente_processo?.stdout.on('data', (data) => {
//      cliente_status = 0;
//      cliente_message = data; 0
//      if (String(data).indexOf('Compiled successfully') > -1) cliente_status = 2;
//  });
/**
 * Serviço da Aplicação
 */
const service_process = spawn('node',
    [
        './node_modules/@nestjs/cli/bin/nest',
        'start',
        '--watch',
        '--debug'
    ],
    {
        cwd: __dirname + '/../server',
        env: {
            NODE_OPTIONS: '--openssl-legacy-provider'
        }
    })
    .on('data', m => console.log(m))
    .on('error', m => console.log(m))
    .on('message', m => console.log(m))
    ;
let status_service = 0;
let message_service = null;
service_process.stdout.on('data', (data) => {
    message_service = data;
    if (String(data).indexOf('running') > -1) status_service = 2;
});
let last = undefined;
const Renrer = () => {
    let out =
        `[aplicação em execução]
{ s:${status_service} }
`;
    //  if (cliente_message)
    //      out += `[ client ]: \n${String(cliente_message).trim()}\n`;
    if (message_service)
        out += `[ service ]: \n${String(message_service).trim()}\n`;
    if (out != last) {
        last = out;
        console.clear();
        console.log(out);
    }
    setTimeout(() => Renrer(), 700);
}
Renrer();
let express = require('express');
let cors = require('cors');
let fs = require('fs');
let https = require('https');
let { config } = require('dotenv');
let bodyParser = require('body-parser');
config({ path: './server/.env' });
const options = {
    // cert: process.env.cert ? fs.readFileSync(process.env.cert) : undefined,
    // key: process.env.key ? fs.readFileSync(process.env.key) : undefined,
    pfx: process.env.pfx ? fs.readFileSync(process.env.pfx) : undefined,
    passphrase: process.env.passphrase ? process.env.passphrase : undefined
};
let app = express();
let PORT = 7685;
app.use(cors({
    origin: [
        // 'http://localhost:7685',
        // 'http://localhost:4293',
        'https://apps.ci.dev.br:446',
        // 'https://apps.ci.dev.br:7684'
    ]
}));
app.get('/json', function (req, res) {
    res.json({
        client: cliente_status,
        service: status_service,
    });
});
app.get('/', async (req, res) => {
    res.send(fs.readFileSync(__dirname + '/tmplt/console.html').toString('utf8'));
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * TODO: Implementar camada de segurança para poder liberar esse recurso. Muito sensível.
 * 
 */
// app.post('/', async (req, res) => {
//     try {
//         res.send({
//             result: eval(`(() => {
//                     ${req.body.text}
//                 })();`)
//         });
//     } catch (error) {
//         console.trace(error);
//     }
// });
app.listen(PORT, function () {
    console.log('Express is listening:' + PORT + '');
},).addListener('error', (e) => {
    console.log('Erro!', e);
    if (e.message.indexOf('EADDRINUSE') > -1) {
        console.log('Parar aplicação!');
        let c = spawn('powershell', ['-ExecutionPolicy', 'ByPass']);
    }
});

// Implementação antiga não concluída
//
// function syncUpAll() {
// }

// Implementação antiga não concluída
// function updateProcessInfo() {
// }

// implementação antiga não concluída
// function command(command, repo = __dirname) {
//     const processo = {
//         status: -1,
//         processo: spawn('node', ['./node_modules/@angular/cli/bin/ng.js', 'serve'], {
//             cwd: __dirname + '/../client'
//         })
//             .on('data', m => console.log(m))
//             .on('error', m => console.log(m))
//             .on('message', m => console.log(m))
//     };
//     processos.push(processo);
// }