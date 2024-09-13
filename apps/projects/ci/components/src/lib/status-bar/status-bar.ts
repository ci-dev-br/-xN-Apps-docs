import { Component, NgModule, Optional } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
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
    emit() {
        let data = prompt('Message Data');
        if (data)
            this.ws?.emit(data);
    }
}
@NgModule({
    imports: [
        CoreModule,
        MatButtonModule,
    ],
    exports: [
        StatusBarComponent
    ],
    declarations: [
        StatusBarComponent
    ],
}) export class StatusBarModule { }