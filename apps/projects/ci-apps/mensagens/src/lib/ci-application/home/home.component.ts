import { Component } from '@angular/core';
import { ConversasComponent } from '../../conversas/conversas.component';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
    selector: 'ci-home',
    imports: [
        ConversasComponent,
        RouterModule,
        MatSidenavModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
