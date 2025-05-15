require('./src/main');
const mem = {};
const https = require('https');
async function prov_of_life() {
    if (mem.lived === undefined) mem.lived = 0;
    mem.lived++;
    https.get('https://srv33.internals.ci.dev.br:664/', res => {
        console.log(res.statusCode);
        setTimeout(() => prov_of_life(), 10000);
    }).on('error', res => {
        console.log('Error', res, mem);
        // if (res.statusCode === 504) {
        if (mem.tryed === undefined) {
            mem.tryed = 0;
        }
        mem.tryed++;
        if (mem.tryed === 8) {
            try {
                require('child_process').execSync('git config --global --add safe.directory C:/projetos/br.dev.ci.apps', { cwd: 'c:\\projetos\\br.dev.ci.apps\\' }).toString()
                console.log('[Revertendo alterações no git devido a muitas falhas na inicialização]',
                    require('child_process').execSync('git stash push -u -m stached', { cwd: 'c:\\projetos\\br.dev.ci.apps\\' }).toString()
                )
            } catch (error) {
                console.error('[Falha ao tentar realizar stash em git]', error);
            }
            mem.tryed = 0;
            if (!mem.tryed2) mem.tryed2 = 0;
            mem.tryed2++;
            if (mem.tryed2 > 3) {
                require('child_process').execSync('shutdown /r');
            }
        }
        //}
        setTimeout(() => prov_of_life(), 1000);
    })
}
setTimeout(() => prov_of_life(), 10000);