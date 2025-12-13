/**
 * Verifica se uma string parece ser um número de telefone brasileiro válido
 * (fixo ou celular, com 10 ou 11 dígitos) após limpar a formatação.
 * * Esta função ignora máscaras (parênteses, traços, espaços) e
 * trata o DDI "55" opcional.
 *
 * @param phone A string para validar.
 * @returns true se for um formato de telefone brasileiro válido, false caso contrário.
 */
export function IsPhoneNumber(phone: string): boolean {
    if (!phone) {
        return false;
    }

    // 1. Remove todos os caracteres não numéricos
    // (Ex: "+55 (11) 98765-4321" -> "5511987654321")
    const justDigits = phone.replace(/\D/g, '');

    // 2. Remove o DDI 55, se estiver presente no início
    let localNumber = justDigits;
    if (localNumber.startsWith('55')) {
        localNumber = localNumber.substring(2);
    }

    // 3. O número local (DDD + Número) deve ter 10 (fixo) ou 11 (celular) dígitos
    const length = localNumber.length;

    if (length === 10) {
        // Número fixo válido (DDD com 2 dígitos + 8 dígitos de número)
        return true;
    }

    if (length === 11) {
        // Número celular válido (DDD com 2 dígitos + '9' + 8 dígitos de número)
        // Verificamos se o terceiro dígito (índice 2) é '9'
        return localNumber[2] === '9';
    }

    // Se não tiver 10 ou 11 dígitos, não é um formato brasileiro válido
    return false;
}