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
