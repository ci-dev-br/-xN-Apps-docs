import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";


@Component({
    standalone: true,
    imports: [
        RouterModule,
    ],
    selector: 'Navbar',
    template: `<nav>
        <ul>
            <li>
                <a routerLink="registrar">Registrar</a>
            </li>
            <li>
                <a routerLink="acessar">Entrar</a>
            </li>
        </ul>
    </nav>`,
    styles: [
        `
         nav {
        display: flex;
        flex-direction: row;
        position: absolute;
        right: 10px;
        top: 0px;
        gap: 8px;
        padding: 12px;

        ul,
        li {
            display: contents;
        }

        a {
            padding: 12px;
            color: white;
            background-color: black;
            border-radius: 12px;
        }
    }`
    ]
})
export class NavbarComponent {
    constructor() { }
}