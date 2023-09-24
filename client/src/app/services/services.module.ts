import { NgModule } from "@angular/core";
import { UserService } from "./user.service";
import { RouterModule } from "@angular/router";
import { RolesService } from "./roles.service";
import { CoreModule } from "../core/core.module";

@NgModule({
    imports: [
        CoreModule,
        RouterModule,
    ],
    providers: [
        UserService,
        RolesService,
    ]
})
export class ServicesModule { }