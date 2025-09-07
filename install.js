const Service = require('node-windows').Service;
const __error = console.error;
const __log = console.log;
const __trace = console.trace;
function d() {
  return `[${(new Date()).toLocaleTimeString()}]`;
}
console.error = (...arg) => { __error(d(), ...arg); }
console.log = (...arg) => { __log(d(), ...arg); }
console.trace = (...arg) => { __trace(d(), ...arg); }
var svc = new Service({
  name: 'br.dev.ci.Apps',
  description: 'Web Apps Cloud Services',
  script: __dirname + '/start.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  allowServiceLogon: process.env.ServicesAllowServiceLogon || undefined,
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