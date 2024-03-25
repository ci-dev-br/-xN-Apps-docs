const { spawn } = require('child_process');

/**
 * Cliente da Aplicação
 */
const cliente_processo = spawn('node', ['./node_modules/@angular/cli/bin/ng.js', 'serve'], { cwd: __dirname + '/client' })
    .on('data', m => console.log(m))
    .on('error', m => console.log(m))
    .on('message', m => console.log(m))
    ;

let processos = [];
let cliente_status = 0;
let cliente_message = null;
cliente_processo.stdout.on('data', (data) => {
    cliente_status = 0;
    cliente_message = data;
    if (String(data).indexOf('Compiled successfully') > -1) cliente_status = 2;
});

/**
 * Serviço da Aplicação
 */
const service_process = spawn('node',
    [
        '--openssl-legacy-provider',
        './node_modules/@nestjs/cli/bin/nest',
        'start',
        '--watch'
        // './dist/main.js',
        // '--prod',
    ], { cwd: __dirname + '/server' })
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
const print = () => {
    let out =
        `[aplicação em execução]
{ s:${status_service} }
`;
    if (cliente_message)
        out += `[client]: \n${String(cliente_message).trim()}\n`;
    if (message_service)
        out += `[service]: \n${String(message_service).trim()}\n`;

    if (out != last) {
        last = out;
        // console.clear();
        console.log(out);
    }
    setTimeout(() => print(), 700);
}
print();
var express = require('express');
var cors = require('cors');
var fs = require('fs');
var https = require('https');
var { config } = require('dotenv');
var bodyParser = require('body-parser');
config({ path: './server/.env' });
const options = {
    // cert: process.env.cert ? fs.readFileSync(process.env.cert) : undefined,
    // key: process.env.key ? fs.readFileSync(process.env.key) : undefined,
    pfx: process.env.pfx ? fs.readFileSync(process.env.pfx) : undefined,
    passphrase: process.env.passphrase ? process.env.passphrase : undefined
};


var app = express();
var PORT = 7685;
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
app.post('/', async (req, res) => {
    try {
        res.send({
            result: eval(`(() => {
                    ${req.body.text}
                })();`)
        });
    } catch (error) {
        console.error(error);
    }
});
app.listen(PORT, function () {
    console.log('Express is listening:' + PORT + '');
});
function syncUpAll() {
}
function updateProcessInfo() {
}
function command(command, repo = __dirname) {
    const processo = {
        status: -1,
        processo: spawn('node', ['./node_modules/@angular/cli/bin/ng.js', 'serve'], {
            cwd: __dirname + '/client'
        })
            .on('data', m => console.log(m))
            .on('error', m => console.log(m))
            .on('message', m => console.log(m))
    };
    processos.push(processo);
}