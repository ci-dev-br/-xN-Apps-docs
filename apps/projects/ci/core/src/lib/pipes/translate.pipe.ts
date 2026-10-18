import { Pipe, PipeTransform } from '@angular/core';

// 1. Estendendo o objeto Window para incluir a API de tradução experimental
declare global {
    interface Window {
        translation?: {
            canTranslate(options: { sourceLanguage: string; targetLanguage: string }): Promise<'no' | 'readily' | 'after-download'>;
            createTranslator(options: { sourceLanguage: string; targetLanguage: string }): Promise<Translator>;
        };
    }
}

interface Translator {
    translate(text: string): Promise<string>;
    destroy?(): void;
}

@Pipe({
    name: 'translate',
    standalone: true
})
export class TranslatePipe implements PipeTransform {
    // Guarda a instância do tradutor para não recriá-la a cada string
    private translatorInstance: Translator | null = null;
    private currentSourceLang = '';

    // Cache de strings já traduzidas
    private cache = new Map<string, string>();

    async transform(value: string, sourceLang: string = 'en'): Promise<string> {
        if (!value) return '';

        const cacheKey = `${sourceLang}-${value}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

        // 2. Fallback caso o navegador do usuário não suporte a API
        if (!window.translation) {
            console.warn('Translation API não suportada neste navegador.');
            return value;
        }

        try {
            // 3. Verifica se precisamos criar um novo tradutor
            if (!this.translatorInstance || this.currentSourceLang !== sourceLang) {

                // Verifica se o navegador tem o pacote de idioma disponível ou pode baixá-lo
                const status = await window.translation.canTranslate({
                    sourceLanguage: sourceLang,
                    targetLanguage: 'pt'
                });

                if (status === 'no') {
                    console.warn(`Tradução de ${sourceLang} para pt-BR não suportada pelo modelo local.`);
                    return value;
                }

                // Se o status for 'after-download', o navegador baixará o pacote em background 
                // automaticamente ao chamar o createTranslator
                this.translatorInstance = await window.translation.createTranslator({
                    sourceLanguage: sourceLang,
                    targetLanguage: 'pt'
                });

                this.currentSourceLang = sourceLang;
            }

            // 4. Traduz o texto localmente via IA do navegador
            const translatedText = await this.translatorInstance.translate(value);

            this.cache.set(cacheKey, translatedText);
            return translatedText;

        } catch (error) {
            console.error('Erro na API nativa de tradução:', error);
            return value; // Retorna original se falhar
        }
    }
}