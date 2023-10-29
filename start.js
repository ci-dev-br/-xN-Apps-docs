const { spawn } = require('child_process');

const client_process = spawn('node', ['./node_modules/@angular/cli/bin/ng.js', 'serve'], { cwd: __dirname + '/client' })
    .on('data', m => console.log(m))
    .on('error', m => console.log(m))
    .on('message', m => console.log(m))
    ;

let processos = [];
let status_cliente = 0;
let message = null;
client_process.stdout.on('data', (data) => {
    status_cliente = 0;
    message = data;
    if (String(data).indexOf('Compiled successfully') > -1) status_cliente = 2;
});
const service_process = spawn('node',
    [
        'node_modules/@nestjs/cli/bin/nest.js',
        'start',
        '--watch'
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

const print = () => {
    console.clear();
    console.log('[aplicação em execução]');
    console.log(`   { c:${status_cliente} s:${status_service} }`);
    if (message)
        console.log(`[client]: \n${String(message).trim()}`);
    if (message_service)
        console.log(`[service]: \n${String(message_service).trim()}`);
    setTimeout(() => print(), 700);
}
print();

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var https = require('https');
var { config } = require('dotenv');
config({ path: './server/.env' });
const options = {
    // cert: process.env.cert ? fs.readFileSync(process.env.cert) : undefined,
    // key: process.env.key ? fs.readFileSync(process.env.key) : undefined,
    pfx: process.env.pfx ? fs.readFileSync(process.env.pfx) : undefined,
    passphrase: process.env.passphrase ? process.env.passphrase : undefined
};

var app = express();
var PORT = 7684;

app.use(cors({
    origin: ['http://localhost:4293', 'https://apps.ci.dev.br:3232', 'https://apps.ci.dev.br:7684']
}));
app.get('/json', function (req, res) {
    res.json({
        client: status_cliente,
        service: status_service,
    });
})
// app.listen(PORT, function () {
//     console.log('Express is listening:' + PORT + '!');
// })
const https_service = https.createServer(app, options);

https_service.listen(PORT, function () {
    console.log("server running at " + PORT)
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