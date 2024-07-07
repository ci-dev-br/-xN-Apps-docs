import { Injectable } from "@nestjs/common";
import { CadastroBase, IDynamicForm } from "../CadastroBase";

/**
 * Cadastramento de Pessoa Física e Jurídica
 * 
 */
@Injectable()
export class CadastroEnderecoForm extends CadastroBase {
    view: IDynamicForm = {
        title: 'Endereço',
        description: 'Cadastro de Endereços',
        controls: {
            tipoLogradouro: {
                label: 'Tipo Logradouro',
            },
            logradouro: {
                label: 'Logradouro',
            },
        }
    }
}
