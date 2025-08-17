// require('./src/main');
const { execSync, spawnSync, spawn, exec } = require('child_process');
const https = require('https');
const http = require('http');
const { cwd, env } = require('process');
const { config } = require('dotenv');
config();
/**
 * mem - objeto de memória para armazenar informações temporárias
 */
const mem = {};
/**
 * 
 * Monitoramento de conexao externa:
 * 
 *  Verifica de tempos em tempos o estado de conexão da aplicação, 
 * aciona mecanismos para re-estamelecer a normalidade de execução.
 * 
 */
new CiRunner();

let repeat_in = 60000;
/**
 * gitSyncronize - Função para sincronizar o repositório git
 */
/* const gitSyncronize = async () => {
    console.log('git sync')
    let branch_name;
    let spw;
    try {
        branch_name = spawnSync('git', ['branch', '--show-current'], { cwd: __dirname }).stdout.toString().trim();
        spw = spawnSync('git', ['pull', 'azure', branch_name], { cwd: __dirname });
        if (spw.stdout) {
            console.log(spw.stdout.toString());
            if (spw.stdout.toString().indexOf('file changed') > -1) {
                console.log('Start deploy')
                console.log(__dirname + '/gulp')
                await new Promise((res, rej) => {
                    const process = exec('gulp', {
                        cwd: __dirname + '/gulp',
                        env: env
                    });
                    let out = '';
                    let err = '';
                    process.on('data', (data) => {
                        console.log(data);
                        out += data.toString();
                    })
                    process.on('close', (code) => {
                        res(code);
                    })
                    process.on('error', (error) => {
                        rej(error);
                    })
                });
            }
        }
        try {
            spw = spawnSync('git', ['push', '--all', 'origin'], { cwd: __dirname });
            if (spw.stdout) {
                console.log(spw.stdout.toString());
            }
        } catch (error) {
            console.trace(error)
            // TODO:  verificar necessidade de tratamento de erro
        }
        try {
            spw = spawnSync('git', ['push', '--all', 'azure'], { cwd: __dirname });
            if (spw.stdout) {
                console.log(spw.stdout.toString());
            }
        } catch (error) {
            console.trace(error)
            // TODO:  verificar necessidade de tratamento de erro
        }
    } catch (error) {
        console.trace(error);
        // TODO:  verificar necessidade de tratamento de erro
    }
    setTimeout(async () => {
        gitSyncronize();
    }, repeat_in);
}
gitSyncronize(); */
/**
 * ComitterAssistent
 * 
 * This function automates the process of committing changes to a git repository.
 * It adds all changes, generates a commit message using the Gemini AI model, commits the changes with that message.
 * 
 * @returns 
 */
async function ComitterAssistent() {
    await new Promise(async (resolve, reject) => {
        try {
            if (process.env.GEMINI_TOKEN_ASSISTANT) {
                let commitMessage;
                const status_porcelain = spawnSync('git', ['status', '--porcelain'], { cwd: __dirname });
                const status_porcelain_soutstr = status_porcelain.stdout.toString().trim();
                const status = spawnSync('git', ['status'], { cwd: __dirname });
                const status_soutstr = status.stdout.toString().trim();
                if (/* status_porcelain_soutstr === '' ||  */status_soutstr.indexOf('Changes to be committed') === -1) {
                    console.info('No changes to commit');
                    return resolve();
                }
                const diff = spawnSync('git', ['--no-pager', 'diff', '--staged'], { cwd: __dirname });
                const { GoogleGenAI } = require("@google/genai");
                const ai = new GoogleGenAI({
                    apiKey: process.env.GEMINI_TOKEN_ASSISTANT,
                });
                commitMessage = (await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `
# Crie uma mensagem de commit para o git a partir do seguinte status e diff:

### Mensagem de diff:
sh\`\`\`
    ${diff.stdout.toString().trim()}
\`\`\`

### Mensagem de status:
sh\`\`\`
    ${status_soutstr}
\`\`\`

### Mensagem de status com flaq --porcelain:
sh\`\`\`
    ${status_porcelain_soutstr}
\`\`\`

---
Instruções opcionais:
    
A mensagem deve ser uma mensagem final, sem opções, escolha a melhor alternativa
para as informações fornecidas. Você também pode adicionar uma consideração final
ou até mesmo comentários ou piada se achar pertinente. 
A mensagem deve ser o mais completa possível, com o mínimo de redundância.
Adicione também referências externas como wikipedia ou artigos cientificos públicos que relatam 
e discorrem sobre o mesmo assunto quando ouver essa possibilidade.cc
Ao final, sugira a próxima ação a ser tomada no projeto.

PS.: Retorne diretamente a mensagem de commit, sem formatação adicional ou explicações. Considere escrever como se você fosse o autor da alteração.
`,
                })).text;
                const statusOutput = status_porcelain.stdout.toString().trim();
                if (!statusOutput) {
                    console.log('No changes to commit');
                    return;
                }
                const commitFilePath = __dirname + '/COMMIT';
                require('fs').writeFileSync(commitFilePath, commitMessage);
                const commitCommand = spawnSync('git', ['commit', '-F', commitFilePath], { cwd: __dirname });
                if (commitCommand.stdout) {
                    console.log(commitCommand.stdout.toString());
                }
                if (commitCommand.stderr) {
                    console.error(commitCommand.stderr.toString());
                }
                require('fs').unlinkSync(commitFilePath);
                const pushCommand = spawnSync('git', ['push', 'origin', 'HEAD'], { cwd: __dirname });
                if (pushCommand.stdout) {
                    console.log(pushCommand.stdout.toString());
                }
            } else {
                console.log('GEMINI_TOKEN_ASSISTANT not set, skipping commit');
            }
        } catch (error) {
            console.error('Error in ComitterAssistent:', error);
        }
        resolve();
    });
    /*  setTimeout(() => {
         ComitterAssistent();
     }, 10000); */
}
/* setTimeout(() => {
    ComitterAssistent();
}, 1000); */
