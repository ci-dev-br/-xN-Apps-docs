const https = require('https');
const postData = JSON.stringify({
    local_exec: __dirname,
    url_report: process.env.BUILD_URL
});
console.log(process)
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
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});
req.on('error', (e) => {
    console.error(e);
});
req.write(postData);
req.end();