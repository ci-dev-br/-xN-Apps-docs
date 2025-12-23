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

    async findUpdate() {

    }
}


// await assistent.gpt()