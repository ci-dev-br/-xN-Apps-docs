const { config } = require("dotenv");
config('.env');
class Assistant {
    quota = 1;
    constructor() {
        /**
         * Libera 1 cota a cada minuto. quando zera a quota deve esperar nova quota para liberar execução
         */
        setInterval(() => {
            if (this.quota < 3) {
                this.quota++;
            }
        }, 60 * 1000);
    }
    async gpt(prompt) {
        return await new Promise(async (resolve, reject) => {
            try {
                if (this.quota > 0) {
                    if (process.env.GEMINI_TOKEN_ASSISTANT) {
                        let commitMessage;
                        const { GoogleGenAI } = require("@google/genai");
                        const ai = new GoogleGenAI({
                            apiKey: process.env.GEMINI_TOKEN_ASSISTANT,
                        });
                        commitMessage = (await ai.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: `${prompt}`,
                        })).text;

                        resolve(commitMessage);
                    } else {
                        console.error('GEMINI_TOKEN_ASSISTANT not set, skipping commit');
                    }
                    this.quota--;
                } else {
                    setTimeout(async () => {
                        resolve(await this.gpt(prompt));
                    }, 60 * 1000); // Espera 1 minuto para tentar novamente
                }
            } catch (error) {
                console.error('Falha ao executar assistente de commit:', error);
            }
        });
    }
}
exports.Assistant = Assistant;