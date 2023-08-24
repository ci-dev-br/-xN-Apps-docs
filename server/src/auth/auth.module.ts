import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeORMError } from "typeorm";
import { AuthController } from "./controller/auth.controller";
import { UserService } from "./service/user.service";
import { User } from "./models/user.entity";
import { Application } from "./models/application.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Application,
        ]),
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        UserService,
    ],
    exports: [
        UserService,
    ]
})
export class AuthModule { }