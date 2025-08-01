var Service = require('node-windows').Service;


// Create a new service object
var svc = new Service({
  name: 'Apps',
  description: 'Apps.ci.dev.br Cloud Services',
  script: 'C:\\projetos\\br.dev.ci.apps\\start.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
  // , allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
  svc.start();
  console.log('install');
});

svc.install();
