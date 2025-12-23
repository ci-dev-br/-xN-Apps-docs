
class Assistant {
    async gpt(prompt) {
        await new Promise(async (resolve, reject) => {
            try {
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
            } catch (error) {
                console.error('Falha ao executar assistente de commit:', error);
            }
        });
    }
}

exports.Assistant = Assistant;