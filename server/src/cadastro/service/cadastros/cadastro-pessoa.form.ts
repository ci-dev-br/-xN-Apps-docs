import { Injectable } from "@nestjs/common";
import { CadastroBase, IDynamicForm } from "../CadastroBase";
import { L } from "src/globalization/default";

/**
 * Cadastramento de Pessoa Física e Jurídica
 * 
 * 
 */
@Injectable()
export class CadastroPessoaForm extends CadastroBase {
    view: IDynamicForm = {
        title: 'Pessoas',
        description: 'Cadastramento de Pessoas',
        controls: {
            nome: {
                label: L.Nome,
                maxLenght: 120,
            },
            nomeUsual: {
                label: L.NomeFantasia,
                maxLenght: 120,
            },
            nomeCompleto: {
                label: L.NomeCompleto,
            },
            dataNascimento: {
                label: L.DataNascimento,
            },
            sobrenome: {
                label: L.Sobrenome,
                maxLenght: 120, // TODO; refletir valor do decorator de column
            },
            razaoSocial: {
                label: L.RazaoSocial,
            },
            nomeFantasia: {
                label: L.NomeFantasia,
            },
            registroGeralRepublicaBrasileira: {
                label: L.RG,
            },
            registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor: {
                label: L.RGOE,
            },
            emailPessoal: {
                label: L.EmailPessoal,
            },
            empresa: {
                label: L.Empresa,
            },
            endereco: {
                label: L.Endereco,
            },
            indformacaoParaContato: {
                label: L.InformacaoParaContato,
            },
            site: {
                maxLenght: 512,
                label: L.Site,
            },
            tipoJuridico: {
                label: L.TipoJuridico,
                maxLenght: 1
            },
            documentos: {
                label: L.Docuemntos,
            },
        }
    }
}
