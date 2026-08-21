const https = require('https');
const postData = JSON.stringify({
    local_exec: __dirname,
    BUILD_URL: process.env.BUILD_URL || 'https://jenkins.ci.dev.br/job/%C3%80pps%20Produ%C3%A7%C3%A3o/job/2026.april/139/',
    BUILD_TAG: process.env.BUILD_TAG,
});
const options = {
    hostname: 'apps.ci.dev.br',
    port: 443,
    path: '/Deployer/report',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    },
};
const req = https.request({
    ...options,
}, (res) => {
    res.on('data', (d) => {
        console.log('Notificao à apps.ci.dev.br distribuição disponível.')
        process.exit(0);
    });
});
req.on('error', (e) => {
    console.error(e);
});
req.write(postData);
req.end();