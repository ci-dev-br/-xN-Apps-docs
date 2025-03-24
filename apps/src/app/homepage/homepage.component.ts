import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthModule } from '@ci/auth';
import { NavbarModule } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
    selector: 'ci-homepage',
    imports: [
        CommonModule,
        RouterModule,
        CoreModule,
        AuthModule,
        NavbarModule,
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent {

}
