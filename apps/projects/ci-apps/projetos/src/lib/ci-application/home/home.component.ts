import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ContainerModule, InputModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { models } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { ProjetosService } from '../../projetos.service';

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
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    models = models;
    constructor(
        private readonly projetos: ProjetosService,
    ) { }
    async CreateNewProject() {
        this.projetos.CriarNovoProjeto();
    }
}
