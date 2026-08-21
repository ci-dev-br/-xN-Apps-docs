import { Component } from "@angular/core";
@Component({
    selector: 'x-footer',
    standalone: false,
    styleUrl: 'footer.scss',
    template: `
    <footer>
        <div class="assinatura" style="flex:auto; display:flex; flex-direction: row;">
            Produzido em <a href="https://ci.dev.br" target="_blank">ci.dev.br</a> 2017 - {{ano}}
            <a por="/credits-of-autrhors"></a><span style="flex:auto"></span>
            <a href="/termos-de-uso">Termos de Uso e Privacidade</a>
        </div>
    </footer>
    `
})
export class Footer {
    ano = '2026';
    //  protected ano = new Date().getFullYear();
}