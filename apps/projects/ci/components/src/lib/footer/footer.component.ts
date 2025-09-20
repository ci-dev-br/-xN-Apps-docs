import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'x-footer',
    standalone: false,
    template: `
    <footer>
        <div class="assinatura" style="flex:auto; display:flex; flex-direction: row;">
            Powered by <a href="https://ci.dev.br" target="_blank">ci.dev.br</a>
            <span style="flex:auto"></span>
            <a href="/termos-de-uso">Termos de Uso e Privacidade</a>
        </div>
    </footer>
    `
})
export class Footer implements OnInit {
    constructor() { }
    async ngOnInit() {

    }
}