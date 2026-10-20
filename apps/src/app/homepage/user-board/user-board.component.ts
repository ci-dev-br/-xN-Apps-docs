import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardModule } from '@ci/components';

@Component({
    selector: 'ci-user-board',
    standalone: true,
    imports: [
        CommonModule,
        BoardModule,
    ],
    templateUrl: './user-board.component.html',
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            min-height: calc(100vh - 120px);
            box-sizing: border-box;
        }
    `]
})
export class UserBoardComponent { }
