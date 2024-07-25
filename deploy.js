(async () => {
    const path = require("path")
    const { cpSync, Sync, mkdirSync, readdirSync, statSync, existsSync } = require('fs');
    const { spawn, } = require('child_process');
    const { copy } = require('fs-extra');
    function deployDist() {
        try {
            copy('.\\apps\\dist\\apps\\browser\\', '.\\server\\public', {
                overwrite: true
            });
        } catch (error) {
            console.error(error);
        }
    }
    const sh = async (command, cwd) => {
        return await new Promise((res, rej) => {
            if(process.argv.indexOf('--skip-build')){
                deployDist();
                return;
            }
            const c = spawn('powershell.exe', [command], { cwd: cwd || __dirname });
            c.stdout.on('data', async (data) => {
                console.info(data.toString());
                const r = data.toString();
                if (String(r).indexOf('todos') > -1) {
                    console.log(c.stdin.write('t'));
                }
                if (String(r).indexOf('Application bundle generation complete') > -1) {
                    deployDist();
                }
            });
            c.stderr.on('data', (data) => {
                console.info(data.toString());
            });
            c.on('exit', (code) => {
                console.log(`Child exited with code ${code}`);
                res(code)
            });
        })
    }
    await sh('node -v');
    await sh('ng build -c production', __dirname + '\\apps');
})();