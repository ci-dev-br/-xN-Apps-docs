import { NgModule } from "@angular/core";
import { ContextMenuDirective } from "./context-menu.directive";
import { CoreModule } from "@ci/core";
import { ContextMenuComponent } from "./context-menu.component";
import { OverlayModule } from "@angular/cdk/overlay";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuItem } from "@angular/material/menu";
@NgModule({
    imports: [
        CoreModule,
        OverlayModule,
        MatButtonModule,
        MatIconModule,
        MatMenuItem
    ],
    declarations: [
        ContextMenuDirective,
        ContextMenuComponent,
    ],
    exports: [
        ContextMenuDirective,
    ],
})
export class ContextMenuModule { }