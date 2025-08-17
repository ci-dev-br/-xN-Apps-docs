import { CommonModule } from '@angular/common';
import { Component, ComponentRef, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AuthModule, UserService } from '@ci/auth';
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
        MatCardModule,
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
    constructor(
        protected readonly userService: UserService,
        private render: Renderer2,
        private el: ElementRef<Element>,
        // private el2: ComponentRef<>,
    ) { }
    bgs = [
        '/bg-apps-290847.jpg'
    ]
    ngOnInit(): void {
        this.mountStyle();
    }
    protected bg?: string;
    async mountStyle() {
        this.bg = this.bgs[Math.round((this.bgs.length - 1) * Math.random())];

    }
}
