const Service = require('node-windows').Service;
// Create a new service object
var svc = new Service({
  name: 'br.dev.ci.Apps',
  description: 'Web Apps Cloud Services',
  script: __dirname + '/start.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  // allowServiceLogon: true,
});
svc.on('uninstall', function () {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
  if (!svc.exists) {
    svc.install();
  }
});
svc.on('install', function () {
  svc.start();
  console.log('Serviço restaurado com sucesso!');
});
if (!svc.exists) {
  svc.install();
} else {
  try {
    svc.uninstall();
  } catch (error) {
  }
}