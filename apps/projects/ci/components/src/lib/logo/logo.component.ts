import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'ci-logo',
    imports: [
        CommonModule,
        RouterModule,
    ],
    standalone: true,
    templateUrl: './logo.component.html',
    styleUrl: './logo.component.scss'
})
export class LogoComponent {
    @Input() link?: string = '/';

    isExternalLink(url?: string): boolean {
        return !!url && (url.startsWith('http://') || url.startsWith('https://'));
    }
}
