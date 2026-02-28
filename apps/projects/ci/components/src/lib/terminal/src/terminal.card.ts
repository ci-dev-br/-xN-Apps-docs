import { Component } from "@angular/core";
import { TerminalComponent } from "./terminal";
@Component({
    selector: 'ci-terminal-card',
    template: '<ci-terminal></ci-terminal>',
    imports: [
        TerminalComponent,
    ],
    standalone: true,
})
export class CardTerminalComponent {

}
export const TerminalCardInfo = {
    title: 'Terminal',
    descricao: `Componente de terminal interativo baseado em xterm.js, permitindo emulação de terminal dentro de aplicações web. Suporta personalização visual, entrada do usuário e redimensionamento dinâmico.`,
    tags: ['Terminal', 'CLI', 'Console'],
    componentRef: CardTerminalComponent,
    componentVersion: '1.0.0',
    componentName: 'TerminalCard',
    settings: {
    }
};