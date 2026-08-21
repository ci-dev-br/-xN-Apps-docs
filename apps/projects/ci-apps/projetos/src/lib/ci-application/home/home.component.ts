import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ContainerModule, InputModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { MatIconModule } from '@angular/material/icon';
import { WindowModule } from '@ci/components/window';
export enum ProjetoVisibilidade {
    Publico = 'Público',
    Privado = 'Privado'
}

export interface Endereco {
    logradouro?: string;
    cidade?: string;
    estado?: string;
}

export interface Pessoa {
    nome?: string;
    cpf?: string;
}

export interface ClienteProjeto {
    nome?: string;
    tipo?: string;
    documento?: string;
    email?: string;
    telefone?: string;
    endereco?: Endereco[];
    pessoa?: Pessoa;
}

export interface WorkItem {
    code?: number;
}

export interface Projeto {
    nome?: string;
    descricao?: string;
    visibilidade?: ProjetoVisibilidade;
    controleVersao?: string;
    cliente?: ClienteProjeto;
    dataInicio?: Date;
    workItems?: WorkItem[];
}
@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
        ContainerModule,
        MatButtonModule,
        MatToolbarModule,
        RouterModule,
        InputModule,
        MatIconModule,
        WindowModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    @Input({ required: true }) projeto!: Projeto;
    visibilidadeEnum = ProjetoVisibilidade;
    constructor(
    ) { }
    async CreateNewProject() {
    }
}
