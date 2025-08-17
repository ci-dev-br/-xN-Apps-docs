export class CiRunner {
    constructor() {
        console.log('[ci.dev.br] Hello!')
    }
}


/* 

async function prov_of_life() {
    try {
        console.log('[Prov of liv]')
        if (mem.lived === undefined) mem.lived = 0;
        mem.lived++;
        if (!!process.env.CF_TOKEN) {
            https.get('https://apps.ci.dev.br/', (res) => {
                if (res.statusCode === 530) {
                    try {
                        execSync('cloudflared service uninstall');
                    } catch (error) {
                        console.trace(error)
                    }
                    try {
                        execSync('cloudflared.exe service install ' + process.env.CF_TOKEN);
                    } catch (error) {
                        console.trace(error)
                    }
                }
            });
        }
        https.get('http://0.0.0.0:86/', res => {
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
                    // TODO: verificar necessidade de reinicialização do serviço
                    // // require('child_process').execSync('git config --global --add safe.directory C:/projetos/br.dev.ci.apps', // { // cwd: 'c:\\projetos\\br.dev.ci.apps\\' }).toString()
                    // // console.log('[Revertendo alterações no git devido a muitas falhas na inicialização]',
                    // //     require('child_process').execSync('git stash push -u -m stached', { cwd: 'c:\\projetos\\br.dev.ci.// // apps\\' }).toString()
                    // // )
                } catch (error) {
                    console.trace('[Falha ao tentar realizar stash em git]', error);
                }
                if (!mem.tryed2) mem.tryed2 = 0;
                mem.tryed2++;
                if (mem.tryed2 > 3) {
                    // require('child_process').execSync('shutdown /r');
                    // TODO: verificar necessidade de reinicialização do serviço
                }
            }
            //}
            setTimeout(() => prov_of_life(), 1000);
        })
    } catch (error) {
        console.trace(error);
    }
}
setTimeout(() => prov_of_life(), 10000);
*/