
/**
 * Classe de tools do git para simplificar fluxos do git 
 * para processos de ci/cd
 * 
 * 
 * Descrição:
 * Esta classe oferece uma interface simplificada para interagir com o Git,
facilitando operações comuns como adicionar, commitar e fazer push de mudanças.
Ela é projetada para ser usada em ambientes de CI/CD, onde a automação de
tarefas Git é essencial para um fluxo de trabalho contínuo.
 */
class Git {
    /**
     * Adiciona todos os arquivos modificados ou novos ao stage.
     * @returns {Promise<void>}
     */
    static async addAll() {
        await this._executeGitCommand(['add', '.']);
    }

    /**
     * Commita as mudanças com uma mensagem específica.
     * @param {string} message - A mensagem do commit.
     * @returns {Promise<void>}
     */
    static async commit(message) {
        await this._executeGitCommand(['commit', '-m', message]);
    }

    /**
     * Faz push das mudanças para o repositório remoto.
     * @param {string} remote - O nome do repositório remoto (ex: 'origin').
     * @param {string} branch - O nome da branch (ex: 'main').
     * @returns {Promise<void>}
     */
    static async push(remote = 'origin', branch = 'HEAD') {
        await this._executeGitCommand(['push', remote, branch]);
    }

    /**
     * Executa um comando Git.
     * @param {string[]} args - Os argumentos do comando Git.
     * @returns {Promise<string>} - A saída do comando.
     * @private
     */
    static async _executeGitCommand(args) {
        return new Promise((resolve, reject) => {
            const { spawn } = require('child_process');
            const gitProcess = spawn('git', args);
            let output = '';
            let errorOutput = '';

            gitProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            gitProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            gitProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Git command failed with code ${code}: ${errorOutput}`));
                }
            });
        });
    }

    /**
     * Verifica se repositório esta atualizado sem mudanças
     * 
     */
    static async isUpToDate() {
        return new Promise((resolve, reject) => {
            const { spawn } = require('child_process');
            const gitProcess = spawn('git', ['status', '--porcelain']);
            let output = '';
            let errorOutput = '';

            gitProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            gitProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            gitProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim() === '');
                } else {
                    reject(new Error(`Git status command failed with code ${code}: ${errorOutput}`));
                }
            });
        });
    }
}

module.exports = Git;       