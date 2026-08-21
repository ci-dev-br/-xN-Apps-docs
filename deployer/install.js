const Service = require('node-windows').Service;
// Create a new service object
const svc = new Service({
    name: 'br.dev.ci.deployer',
    description: 'Micro Application Deloyer.',
    script: __dirname + '/main.js',
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
    // , workingDirectory: 'C:\\projetos\\br.dev.ci.apps\\'
    // , allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    console.log('Instalando')
    svc.start();
    console.log('ENDs')
});
// svc.on('install', function () {
//     
// });
// svc.
// svc.uninstall();
svc.install();