export class DetalheFalha {
    constructor(error: Error) {

    }
    toJSON() {
        return {
            status: -1,
            mensagem: 'Erro não identificado, tente mais tarde'
        }
    }
}