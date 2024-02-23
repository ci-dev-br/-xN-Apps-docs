import { Injectable } from "@nestjs/common";
import { CadastroBase, IDynamicForm } from "../CadastroBase";

/**
 * Cadastramento de Pessoa Física e Jurídica
 * 
 * 
 */
@Injectable()
export class CadastroImagensForm extends CadastroBase {
    view: IDynamicForm = {
        title: 'Arquivos',
        description: 'Cadastro de Arquivos',
        controls: {
        }
    }
}
