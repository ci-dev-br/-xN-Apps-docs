import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";



@Component({
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        
    ],
    templateUrl: 'deployer-menu.html'
})
export class DeployerMenu {


}