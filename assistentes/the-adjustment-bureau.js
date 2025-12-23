const { Assistant } = require('./assistent');


/**
 *  * The Adjustment Bureau Assistant
 *
 * This assistant is responsible for reviewing and adjusting the code.
 * It uses the Gemini API to analyze code changes and suggest improvements.
 *
 * 
 * "Os Ajustadores (The Adjustment Bureau): Personagens que intervêm na vida humana para garantir que o "plano" seja seguido, fazendo pequenos ajustes (updates) na realidade quando algo sai do trilho."
 * 
 * Angular Update, com assistente gpt
 * 
 * 
 * Descrição:
 * Este assistente é responsável por manter as dependências do projeto atualizadas,
especialmente as relacionadas ao Angular. Ele utiliza a API do Gemini para
analisar as alterações e sugerir atualizações, garantindo que o projeto
permaneça alinhado com as melhores práticas e versões mais recentes das bibliotecas.
 *     async run() {
        console.log('The Adjustment Bureau is running...');
        // Exemplo de uso:
        // const prompt = "Analise o seguinte trecho de código e sugira melhorias: [código aqui]";
        // const suggestion = await this.assistent.gpt(prompt);
        // console.log('Sugestão do assistente:', suggestion);
    }
 * 
 */
class TheAdjustmentBureau {
    constructor() {
        this.assistent = new Assistant();
    }

    /**
     * Verifica se existe atualização existente a partir de `ng update`
     * prepara o comando para atualizar e atualiza quando a prancheta estiver limpa. 
     */
    async findUpdate() {
        const { spawnSync } = require('child_process');
        const { Git } = require('./git');

        console.log('Checking for updates...');

        // Verifica se há alterações não commitadas
        const isUpToDate = await Git.isUpToDate();
        if (!isUpToDate) {
            console.error('There are uncommitted changes. Please commit or stash them before updating.');
            return;
        }

        // Executa ng update para verificar atualizações
        const ngUpdateCheck = spawnSync('ng', ['update'], { encoding: 'utf-8' });

        if (ngUpdateCheck.error) {
            console.error('Error running ng update:', ngUpdateCheck.error);
            return;
        }

        const output = ngUpdateCheck.stdout + ngUpdateCheck.stderr;
        console.log('ng update output:', output);

        // Analisa a saída para encontrar atualizações disponíveis
        const updates = output.match(/ng update (@angular\/\w+(?:-\w+)*)(?:@(\d+\.\d+\.\d+))?/g);

        if (updates && updates.length > 0) {
            console.log('Updates found:');
            for (const update of updates) {
                console.log(`- ${update}`);
                // Pergunta ao assistente se deve aplicar a atualização
                const prompt = `Should I apply the following Angular update: "${update}"? Provide a concise "yes" or "no" answer, followed by a brief explanation if "yes".`;
                const decision = await this.assistent.gpt(prompt);
                console.log(`Assistant's decision for "${update}": ${decision}`);

                if (decision.toLowerCase().includes('yes')) {
                    console.log(`Applying update: ${update}`);
                    const packageName = update.split(' ')[2]; // Extrai o nome do pacote
                    const ngUpdateApply = spawnSync('ng', ['update', packageName, '--allow-dirty', '--force'], { encoding: 'utf-8' });

                    if (ngUpdateApply.error) {
                        console.error(`Error applying update ${packageName}:`, ngUpdateApply.error);
                    } else {
                        console.log(`Update ${packageName} applied successfully.`);
                        // Commita a atualização
                        const commitMessage = `Update ${packageName}`;
                        await Git.addAll();
                        await Git.commit(commitMessage);
                        await Git.push();
                    }
                }
            }
        } else {
            console.log('No updates found.');
        }
    }
}

exports.TheAdjustmentBureau = TheAdjustmentBureau;