/**
 * Verifica se uma string é um endereço de e-mail válido.
 * @param email A string a ser validada.
 * @returns true se for válido, false caso contrário.
 */
export function IsEmail(email?: string): boolean {
    // Verifica se a string está vazia ou é nula antes de testar o regex
    if (!email) return false;

    // Regex padrão robusto para validação de e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email);
}