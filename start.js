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
        console.log('Error', res.statusCode);
        if (res.statusCode === 504) {
            if (mem.tryed === undefined) {
                mem.tryed = 0;
            }
            mem.tryed++;
            if (mem.tryed === 8) {
                require('child_process').execSync('shutdown /r');
            }
        }
        setTimeout(() => prov_of_life(), 2000);
    })
}
setTimeout(() => prov_of_life(), 10000);