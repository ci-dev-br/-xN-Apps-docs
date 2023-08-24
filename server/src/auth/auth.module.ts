import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeORMError } from "typeorm";
import { AuthController } from "./controller/auth.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            
        ]),
    ],
    controllers: [
        AuthController,
    ]
})
export class AuthModule { }