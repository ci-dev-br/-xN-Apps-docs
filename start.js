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
async function prov_of_life() {
    try {
        console.log('[Prov of liv]')
        if (mem.lived === undefined) mem.lived = 0;
        mem.lived++;
        if (!!process.env.CF_TOKEN) {
            https.get('https://apps.ci.dev.br/', (res) => {
                if (res.statusCode === 530) {
                    try {
                        execSync('cloudflared service uninstall');
                    } catch (error) {
                        console.trace(error)
                    }
                    try {
                        execSync('cloudflared.exe service install ' + process.env.CF_TOKEN);
                    } catch (error) {
                        console.trace(error)
                    }
                }
            });
        }
        https.get('https://srv33.internals.ci.dev.br:664/', res => {
            console.log(res.statusCode);
            setTimeout(() => prov_of_life(), 10000);
        }).on('error', res => {
            console.log('Error', res.statusCode, res, mem,);
            if (mem.tryed === undefined) {
                mem.tryed = 0;
            }
            mem.tryed++;
            if (mem.tryed === 10) {
                try {
                    // TODO: verificar necessidade de reinicialização do serviço

                    // // require('child_process').execSync('git config --global --add safe.directory C:/projetos/br.dev.ci.apps', // { // cwd: 'c:\\projetos\\br.dev.ci.apps\\' }).toString()
                    // // console.log('[Revertendo alterações no git devido a muitas falhas na inicialização]',
                    // //     require('child_process').execSync('git stash push -u -m stached', { cwd: 'c:\\projetos\\br.dev.ci.// // apps\\' }).toString()
                    // // )
                } catch (error) {
                    console.trace('[Falha ao tentar realizar stash em git]', error);
                }
                if (!mem.tryed2) mem.tryed2 = 0;
                mem.tryed2++;
                if (mem.tryed2 > 3) {
                    // require('child_process').execSync('shutdown /r');
                    // TODO: verificar necessidade de reinicialização do serviço
                }
            }
            //}
            setTimeout(() => prov_of_life(), 1000);
        })
    } catch (error) {
        console.trace(error);
    }
}
setTimeout(() => prov_of_life(), 10000);
let repeat_in = 60000;
/**
 * gitSyncronize - Função para sincronizar o repositório git
 */
const gitSyncronize = async () => {
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
// gitSyncronize();

/**
 * ComitterAssistent
 * 
 * This function automates the process of committing changes to a git repository.
 * It adds all changes, generates a commit message using the Gemini AI model, commits the changes with that message.
 * 
 * @returns 
 */
async function ComitterAssistent() {
    try {
        if (process.env.GEMINI_TOKEN_ASSISTANT) {
            const spw = spawnSync('git', ['add', '.'], { cwd: __dirname });
            if (spw.stdout) {
                console.log(spw.stdout.toString());
            }
            let commitMessage;
            const diff = spawnSync('git', ['--no-pager', 'diff'], { cwd: __dirname });
            const status = spawnSync('git', ['status', '--porcelain'], { cwd: __dirname });
            const { GoogleGenAI } = require("@google/genai");
            const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_TOKEN_ASSISTANT,
            });
            commitMessage = (await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `
                Crie uma mensagem de commit para o git a partir do seguinte status e diff:
                
                diff
                \`\`\`
                    ${status.stdout.toString().trim()}
                \`\`\`

                status
                \`\`\`
                    ${status.stdout.toString().trim()}
                \`\`\`

                Instruções adiconais: 
                A mensagem deve ser uma mensagem final, sem opções, escolha a melhor alternativa
                para as informações fornecidas. Você também pode adicionar uma consideração final
                ou até mesmo comentários ou piada se achar pertinente. 

                A mensagem deve ser o mais completa possível, com o mínimo de redundância.

                Adicione também referências externas como wikipedia ou artigos cientificos públicos que relatam 
                e discorrem sobre o mesmo assunto quando ouver essa possibilidade.

                Ao final, sugira a próxima ação a ser tomada no projeto.
                `,
            })).text;
            const statusOutput = status.stdout.toString().trim();
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

    setTimeout(() => {
        ComitterAssistent();
    }, 10000);
}
setTimeout(() => {
    ComitterAssistent();
}, 1000);