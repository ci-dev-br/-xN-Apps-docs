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
        title: 'Imagens',
        description: 'Cadastro de Imagens',
        controls: {
        }
    }
}
