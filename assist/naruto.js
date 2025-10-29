/**
 * Revisor de código assistente para o projeto.
 * 
 * Este assistente utiliza a API do Gemini para gerar mensagens de commit baseadas nas alterações detectadas no repositório.
 * 
 */
const { GoogleGenAI } = require("@google/genai");
const { config } = require("dotenv");
config();
const ia = GoogleGenAI.setDefaultConfig({
    apiKey: process.env.GEMINI_TOKEN_ASSISTANT,
});

// Ler Changelog
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const __dirname = path.resolve();
/**
 * Função para Ler o arquivo de CHANGELOG.md e com o Gemini criar uma lista com as tarefas em aberto.
 * 
 * @returns {Promise<void>}
 */
async function readChangeLogTasks() {
    try {
        const changelogPath = path.join(__dirname, 'CHANGELOG.md');
        if (fs.existsSync(changelogPath)) {
            const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
            const tasks = changelogContent.match(/- \[ \] (.+)/g) || [];
            return tasks.map(task => task.replace(/- \[ \] /, '').trim());
        } else {
            console.warn('CHANGELOG.md not found.');
            return [];
        }
    } catch (error) {
        console.error('Error reading CHANGELOG.md:', error);
        return [];
    }
}

readChangeLogTasks();