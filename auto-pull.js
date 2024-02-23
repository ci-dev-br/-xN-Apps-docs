(async () => {
    const { spawn } = require('child_process');
    const sh = async (command, cwd) => {
        return await new Promise((res, rej) => {
            const c = require('child_process').spawn('powershell.exe', [command], { cwd: cwd || __dirname });
            c.stdout.on('data', async (data) => {
                console.info(data.toString());
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
    const loop = async () => {
        await sh('git pull --all')
        await sh('git push --all origin')
        setTimeout(() => loop(), 20000);
    }
    loop();
})();