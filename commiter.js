const { spawnSync } = require('child_process');

require('dotenv').config();

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
                // const spw = spawnSync('git', ['add', '.'], { cwd: __dirname });
                // if (spw.stdout) {
                //     console.log(spw.stdout.toString());
                // }
                let commitMessage;
                const status = spawnSync('git', ['status', '--porcelain'], { cwd: __dirname });
                const status_astring = status.stdout.toString().trim();
                if (status_astring === '' || status_astring.indexOf('not staged for commit') > -1) {
                    console.log('squid dib did ');
                    resolve();
                    return;
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
    ${status.stdout.toString().trim()}
\`\`\`

---
InstruÃ§Ãµes opcionais:
    
A mensagem deve ser uma mensagem final, sem opÃ§Ãµes, escolha a melhor alternativa
para as informaÃ§Ãµes fornecidas. VocÃª tambÃ©m pode adicionar uma consideraÃ§Ã£o final
ou atÃ© mesmo comentÃ¡rios ou piada se achar pertinente. 
A mensagem deve ser o mais completa possÃ­vel, com o mÃ­nimo de redundÃ¢ncia.
Adicione tambÃ©m referÃªncias externas como wikipedia ou artigos cientificos pÃºblicos que relatam 
e discorrem sobre o mesmo assunto quando ouver essa possibilidade.cc
Ao final, sugira a prÃ³xima aÃ§Ã£o a ser tomada no projeto.

PS.: Retorne diretamente a mensagem de commit, sem formataÃ§Ã£o adicional ou explicaÃ§Ãµes. Considere escrever como se vocÃª fosse o autor da alteraÃ§Ã£o.
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
        resolve();
    });
    setTimeout(() => {
        ComitterAssistent();
    }, 60000);
}
setTimeout(() => {
    ComitterAssistent();
}, 6000);
