require('./src/main');
const mem = {};
const { execSync, spawnSync, spawn, exec } = require('child_process');
const https = require('https');
const http = require('http');
const { cwd, env } = require('process');
async function prov_of_life() {
    console.log('[prov_of_life]')
    if (mem.lived === undefined) mem.lived = 0;
    mem.lived++;
    if (!!process.env.CF_TOKEN) {
        https.get('https://apps.ci.dev.br/', res => {
            if (res.statusCode === 530) {
                try {
                    execSync('cloudflared service uninstall');
                } catch (error) {
                    console.error(error)
                }
                try {
                    execSync('cloudflared.exe service install ' + process.env.CF_TOKEN);
                } catch (error) {
                    console.error(error)
                }
            }
        });
    }
    https.get('https://srv33.internals.ci.dev.br:664/', res => {
        console.log(res.statusCode);
        setTimeout(() => prov_of_life(), 10000);
    }).on('error', res => {
        console.log('Error', res.statusCode, res, mem,);
        if (mem.tryed === undefined) {
            mem.tryed = 0;
        }
        mem.tryed++;
        if (mem.tryed === 10) {
            try {
                // require('child_process').execSync('git config --global --add safe.directory C:/projetos/br.dev.ci.apps', { // cwd: 'c:\\projetos\\br.dev.ci.apps\\' }).toString()
                // console.log('[Revertendo alterações no git devido a muitas falhas na inicialização]',
                //     require('child_process').execSync('git stash push -u -m stached', { cwd: 'c:\\projetos\\br.dev.ci.// apps\\' }).toString()
                // )
            } catch (error) {
                console.error('[Falha ao tentar realizar stash em git]', error);
            }
            if (!mem.tryed2) mem.tryed2 = 0;
            mem.tryed2++;
            if (mem.tryed2 > 3) {
                // require('child_process').execSync('shutdown /r');
            }
        }
        //}
        setTimeout(() => prov_of_life(), 1000);
    })
}
setTimeout(() => prov_of_life(), 10000);

let repeat_in = 60000;
const gitSync = async () => {
    console.log('git sync')
    let branch_name;
    let spw;
    try {
        branch_name = spawnSync('git', ['branch', '--show-current'], { cwd: __dirname }).stdout.toString().trim();
        spw = spawnSync('git', ['pull', 'azure', branch_name], { cwd: __dirname });
        if (spw.stdout) {
            console.log(spw.stdout.toString());
            if (spw.stdout.toString().indexOf('file changed') > -1) {
                console.log('Start deploy')
                console.log(__dirname + '/gulp')
                await new Promise((res, rej) => {

                    const process = exec('gulp', {
                        cwd: __dirname + '/gulp',
                        env: env
                    });

                    let out = '';
                    let err = '';

                    process.on('data', (data) => {
                        console.log(data);
                        out += data.toString();
                    })

                    process.on('close', (code) => {
                        res(code);
                    })

                    process.on('error', (error) => {
                        rej(error);
                    })
                });
            }
        }
        try {
            spw = spawnSync('git', ['push', '--all', 'origin'], { cwd: __dirname });
            if (spw.stdout) {
                console.log(spw.stdout.toString());
            }
        } catch (error) {
            console.error(error)
            // TODO:  verificar necessidade de tratamento de erro
        }
        try {
            spw = spawnSync('git', ['push', '--all', 'azure'], { cwd: __dirname });
            if (spw.stdout) {
                console.log(spw.stdout.toString());


            }
        } catch (error) {
            console.error(error)
            // TODO:  verificar necessidade de tratamento de erro
        }
    } catch (error) {
        console.error(error)
        // TODO:  verificar necessidade de tratamento de erro
    }

    setTimeout(async () => {
        gitSync();
    }, repeat_in);
}
gitSync();

/* async function verifyInternalRuntime() {
    https.get('https://srv33.internals.ci.dev.br:664/', res => {
        if (res.statusCode === 504) {
            console.error('[precisa rodar novamente ixi]');
        }
    });
} */
/* setTimeout(() => {
    verifyInternalRuntime();
}, 10 * 1000) */