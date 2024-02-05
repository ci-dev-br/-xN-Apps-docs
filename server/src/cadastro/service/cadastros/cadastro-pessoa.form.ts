import { Injectable } from "@nestjs/common";
import { CadastroBase, IDynamicForm } from "../CadastroBase";

/**
 * Cadastramento de Pessoa Física e Jurídica
 * 
 * 
 */
@Injectable()
export class CadastroPessoaForm extends CadastroBase {
    view: IDynamicForm = {
        title: 'Pessoa',
        description: 'Cadastramento de Pessoas',
        controls: {
            nomeUsual: {
                label: 'Nome Completo',
            },
            nomeCompleto: {
                label: 'Nome Completo',
            },
            dataNascimento: {
                label: 'Data Nascimento',
            },
        }
    }
}
