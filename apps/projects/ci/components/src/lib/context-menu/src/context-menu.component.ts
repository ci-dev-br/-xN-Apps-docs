import { Component } from "@angular/core";
import { Subject } from "rxjs";
import { IContextMenu } from "./i-contex-menu";
@Component({
    selector: 'ci-context-menu',
    templateUrl: 'context-menu.component.html',
    standalone: false,
    styleUrl: 'context-menu.component.scss'
}) export class ContextMenuComponent {
    action = new Subject();
    items?: IContextMenu[];
}