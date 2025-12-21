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
async function AssistenteCommit() {
    await new Promise(async (resolve, reject) => {
        try {
            if (process.env.GEMINI_TOKEN_ASSISTANT) {
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
Instruções opcionais:
    
A mensagem deve ser uma mensagem final, sem opções, escolha a melhor alternativa
para as informações fornecidas. Você também pode adicionar uma consideração final
ou até mesmo comentários ou piada se achar pertinente. 
A mensagem deve ser o mais completa possível, com o mínimo de redundância.
Adicione também referências externas como Wikipedia ou artigos científicos públicos que relatam 
e discorrem sobre o mesmo assunto quando houver essa possibilidade.cc
Ao final, sugira a próxima ação a ser tomada no projeto.

PS.: Retorne diretamente a mensagem de commit, sem formatação adicional ou explicações. Considere escrever como se você fosse o autor da alteração.
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
            console.error('Falha ao executar assistente de commit:', error);
        }
        resolve();
    });
    /*   setTimeout(() => {
          AssistenteCommit();
      }, 60000); */
}
setTimeout(() => {
    AssistenteCommit();
}, 0);
