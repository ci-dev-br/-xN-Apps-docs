(async () => {
    const { spawn } = require('child_process');
    const sh = async (command, cwd) => {
        return await new Promise((res, rej) => {
            const c = spawn('powershell.exe', [command], { cwd: cwd || __dirname });
            c.stdout.on('data', async (data) => {
                console.info(data.toString());
                const r = data.toString();
                if (String(r).indexOf('todos') > -1) {
                    console.log(c.stdin.write('t'));
                }
                if (String(r).indexOf('Application bundle generation complete') > -1) {
                    await sh('xcopy .\\dist\\apps\\browser\\ .\\..\\server\\public /I', __dirname + '\\apps');
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
    //  await sh('xcopy .\\dist\\client\\browser\\ .\\..\\server\\public /I', __dirname + '\\client');
})();