const __error = console.error;
const __log = console.log;
const __trace = console.trace;
function d() {
    return `[${(new Date()).toLocaleTimeString()}]`;
}
console.error = (...arg) => { __error(d(), ...arg); }
console.log = (...arg) => { __log(d(), ...arg); }
console.trace = (...arg) => {
    __trace(d(), ...arg.map(x => {
        try {
            if (x instanceof Buffer)
                return x.toString('utf8');
        } catch (error) {
        }
        return x;
    }));
}
const { CiRunner } = require('./dist/ci-runner');
/**
 * mem - objeto de memória para armazenar informações temporárias
 */
// const mem = {};
/**
 * 
 * Monitoramento de conexao externa:
 * 
 *  Verifica de tempos em tempos o estado de conexão da aplicação, 
 * aciona mecanismos para re-estamelecer a normalidade de execução.
 * 
 */
new CiRunner();
