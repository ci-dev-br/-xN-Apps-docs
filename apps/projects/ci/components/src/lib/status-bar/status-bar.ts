import { Component, NgModule, Optional } from "@angular/core";
import { CoreModule, WsService } from "@ci/core";
/**
 * Visualização geral do status da aplicação e das ações do cliente
 */
@Component({
    selector: 'ci-status-bar',
    templateUrl: `status-bar.component.html`,
    styleUrls: [`status-bar.component.scss`],

}) export class StatusBarComponent {
    constructor(
        @Optional() public readonly ws?: WsService
    ) { }
}
@NgModule({
    imports: [
        CoreModule,
    ],
    exports: [
        StatusBarComponent
    ],
    declarations: [
        StatusBarComponent
    ],
}) export class StatusBarModule { }