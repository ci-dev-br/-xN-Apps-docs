import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WindowModule, WindowService } from '@ci/components';
import { CoreModule } from '@ci/core';
import { MenuService } from '../menu-servive';
/**
 * 
 */
@Component({
    selector: 'ci-home',
    imports: [
        CoreModule,
        MatTabsModule,
        MatButtonModule,
        MatDialogModule,
        WindowModule,
        MatIconModule,
        RouterModule,
    ],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    abas?: { label: string, path: string, icon: string }[];
    constructor(
        private readonly route: ActivatedRoute,
        private readonly window: WindowService,
        protected readonly menus: MenuService,
    ) {
        this.abas = route.routeConfig?.children?.map(r => {
            return {
                label: (r?.data as any)?.title || r.path,
                path: '/' + r.path,
                icon: (r?.data as any)?.icon || undefined,
            } as { label: string, path: string, icon: string }
        }) || undefined;
    }
}
