import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardModule } from '@ci/components';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        BoardModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
    private readonly title: string = document.title;
    constructor() {
    }
    ngOnDestroy(): void {
        document.title = this.title;
    }
    ngOnInit(): void {
        document.title = `${this.title} - Dashboard de Vendas`;
    }
}
