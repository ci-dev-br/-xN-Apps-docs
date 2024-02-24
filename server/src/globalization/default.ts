
export interface IDictionary {
    CurrentLang: string;
    NomeCompleto?: string;
    Docuemntos?: string;
    TipoJuridico?: string;
    Site?: string;
    InformacaoParaContato?: string;
    Endereco?: string;
    Empresa?: string;
    EmailPessoal?: string;
    RGOE?: string;
    RG?: string;
    NomeFantasia?: string;
    RazaoSocial?: string;
    Sobrenome?: string;
    DataNascimento?: string;
    CPF?: string;
    Nome?: string;
}

export const L: IDictionary = {
    CurrentLang: 'pt',
    NomeCompleto: "Nome Completo",
    Nome: "Nome",
    Docuemntos: "Docuemntos",
    TipoJuridico: "Natureza Jurídica",
    Site: "Website ou Link",
    InformacaoParaContato: "Informação para Contato",
    Endereco: "Endereço",
    Empresa: "Empresa",
    EmailPessoal: "E-mail pessoal",
    RGOE: "RG Orgão Emisssor",
    RG: "RG",
    CPF: "CPF",
    NomeFantasia: "NomeFantasia",
    RazaoSocial: "RazaoSocial",
    Sobrenome: "Sobrenome",
    DataNascimento: "DataNascimento",
}