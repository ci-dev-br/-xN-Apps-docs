import { NgModule } from "@angular/core";
import { UserService } from "./user.service";
import { RouterModule } from "@angular/router";
import { RolesService } from "./roles.service";
import { CoreModule } from "../core/core.module";
import { FinderService } from "./finder.service";

@NgModule({
    imports: [
        CoreModule,
        RouterModule,
    ],
    exports: [

    ],
    providers: [
        UserService,
        RolesService,
        FinderService,
    ]
})
export class ServicesModule { }