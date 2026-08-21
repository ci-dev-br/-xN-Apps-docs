/**
 * Gerador de nomes utilizando o conceito de blocos fonotáticos (sílabas).
 * Garante que a combinação gerada seja pronunciável e soe natural.
 */
export class GeradorDeNomes {
    // Sílabas comuns para início de palavras
    private readonly prefixos = [
        'al', 'ar', 'be', 'bra', 'ca', 'ce', 'co', 'da', 'de', 'di',
        'el', 'fa', 'fe', 'ga', 'ge', 'ja', 'jo', 'la', 'le', 'li',
        'lu', 'ma', 'me', 'mi', 'na', 'no', 'pa', 'pe', 'ra', 're',
        'ri', 'ro', 'sa', 'si', 'ta', 'te', 'ti', 'va', 've', 'vi'
    ];

    // Sílabas comuns para o meio das palavras (ligações fluidas)
    private readonly meios = [
        'ba', 'ce', 'da', 'de', 'di', 'do', 'fa', 'fe', 'ga', 'ge',
        'la', 'le', 'li', 'lo', 'ma', 'me', 'mi', 'mo', 'na', 'ne',
        'ni', 'no', 'pa', 'pe', 'ra', 're', 'ri', 'ro', 'sa', 'se',
        'ta', 'te', 'ti', 'to', 'va', 've', 'vi'
    ];

    // Sufixos comuns para Nomes (masculinos, femininos e neutros)
    private readonly sufixosNome = [
        'do', 'ro', 'to', 'no', 'co', 'lo', 'mo', 'son', 'ton', 'el',
        'na', 'ra', 'ta', 'ca', 'la', 'ma', 'da', 'va', 'sa', 'ia', 'li'
    ];

    // Sufixos comuns para Sobrenomes (trazendo peso ao sobrenome)
    private readonly sufixosSobrenome = [
        'des', 'res', 'tos', 'za', 'ra', 'ro', 'tes', 'es', 'is',
        'va', 'co', 'do', 'no', 'to', 'rin', 'lan', 'man', 'val'
    ];

    /**
     * Retorna um elemento aleatório de um array
     */
    private sortear<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Capitaliza a primeira letra de uma string
     */
    private capitalizar(palavra: string): string {
        if (!palavra) return '';
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }

    /**
     * Gera uma palavra única (Nome ou Sobrenome)
     */
    private comporPalavra(isSobrenome: boolean = false, minSilabas = 2, maxSilabas = 3): string {
        const totalSilabas = Math.floor(Math.random() * (maxSilabas - minSilabas + 1)) + minSilabas;
        let palavra = this.sortear(this.prefixos);

        for (let i = 1; i < totalSilabas - 1; i++) {
            palavra += this.sortear(this.meios);
        }

        const arraySufixo = isSobrenome ? this.sufixosSobrenome : this.sufixosNome;
        palavra += this.sortear(arraySufixo);

        return this.capitalizar(palavra);
    }

    /**
     * Gera um nome completo aleatório e original
     */
    public gerarNomeCompleto(quantidadeSobrenomes: number = 2): string {
        const nome = this.comporPalavra(false, 2, 3);
        const sobrenomes = [];

        for (let i = 0; i < quantidadeSobrenomes; i++) {
            // Dá aos sobrenomes uma chance de serem um pouco mais longos
            sobrenomes.push(this.comporPalavra(true, 2, 4));
        }

        return `${nome} ${sobrenomes.join(' ')}`;
    }
}

// Exemplo de uso:
// const gerador = new GeradorDeNomes();
// console.log(gerador.gerarNomeCompleto());
// Saídas possíveis: "Marelino Ferando", "Liviara Pates", "Joceco Valman"