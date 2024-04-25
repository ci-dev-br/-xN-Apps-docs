import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [
        UserController,
    ]
})
export class UsersModule { }