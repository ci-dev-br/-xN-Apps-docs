import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'x-footer',
    standalone: false,
    styleUrl: 'footer.scss',
    template: `
    <footer>
        <div class="assinatura" style="flex:auto; display:flex; flex-direction: row;">
            Desenvolvido por <a href="https://ci.dev.br" target="_blank">ci.dev.br</a> 2017 - {{ano}}
            <span style="flex:auto"></span>
            <a href="/termos-de-uso">Termos de Uso e Privacidade</a>
        </div>
    </footer>
    `
})
export class Footer implements OnInit {
    protected ano = new Date().getFullYear();
    constructor() { }
    async ngOnInit() {

    }
}