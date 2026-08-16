import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

export interface VxInfo {
    desc?: string;
    thumbnail?: string;
}
export interface VxCollect {
    title?: string;
    subTitle?: string;
    desc?: string;
    bgUrl?: string;
    galeria?: VxInfo[];
}

@Component({
    selector: 'x-vx',
    templateUrl: `vx.component.html`,
    styleUrl: 'vx.component.scss',
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class Vx {

    colecoes?: VxCollect[] = [
        {
            title: 'Novidades',
            galeria: [
                { desc: `A Ultima Casa` },
                { desc: `Sintonia` },
                { desc: `Harry Potter` },
                { desc: `Ang` },
                { desc: `Avatar` },
            ]
        },
        {
            title: 'Cursos',
            galeria: [
                { desc: `Cursos de Estética` },
                { desc: `Programação para Iniciantes` },
                { desc: `Banco de Dados` },
                { desc: `SQL Para iniciantes` },
                { desc: `SQL Avançado` },
                { desc: `Análise de dados com SQL` },
            ]
        },
    ]
    constructor() { }
}