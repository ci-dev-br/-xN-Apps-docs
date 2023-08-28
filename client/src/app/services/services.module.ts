import { NgModule } from "@angular/core";
import { UserService } from "./user.service";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        RouterModule,
    ],
    providers: [
        UserService,

    ]
})
export class ServicesModule { }