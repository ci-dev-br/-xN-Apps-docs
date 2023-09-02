import { NgModule } from "@angular/core";
import { UserService } from "./user.service";
import { RouterModule } from "@angular/router";
import { RolesService } from "./roles.service";

@NgModule({
    imports: [
        RouterModule,
    ],
    providers: [
        UserService,
        RolesService,
    ]
})
export class ServicesModule { }