import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

/**
 *  Componente para enviar convite a novos usuários
 * 
 * Descrição:
 * Este componente fornece uma interface para enviar convites a novos usuários
 * para se registrarem na plataforma. Ele inclui um formulário simples onde o
 * administrador pode inserir o e-mail do usuário a ser convidado e enviar o convite.
 * 
 *  Funcionalidades:
 * - Formulário para inserir o e-mail do novo usuário.
 * - Botão para enviar o convite.
 * Validação básica do e-mail.
 * Design responsivo utilizando Angular Material.
 * Uso:
 * ```
 * <ci-enviar-convite></ci-enviar-convite>
 * ```
 * 
 * Notas:
 * Este componente é parte do módulo de gerenciamento de usuários e depende dos
 * módulos Angular Material para estilização e funcionalidade.
 * 
 *  
 */
@Component({
    selector: 'ci-enviar-convite',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './enviar-convite.component.html',
    styleUrls: ['./enviar-convite.component.scss'],
})
export class EnviarConviteComponent {
    constructor() { }
}