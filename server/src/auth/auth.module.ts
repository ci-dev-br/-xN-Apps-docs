import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeORMError } from "typeorm";
import { AuthController } from "./controller/auth.controller";
import { UserService } from "./service/user.service";
import { User } from "./models/user.entity";
import { Application } from "./models/application.entity";
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from "./constants";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { CredencialService } from "./service/credencial.service";
import { ChaveAcesso } from "./models/chave-acesso.entity";
import { Policy } from "./models/policy.entity";
import { ApplicationService } from "./service/application.service";
import { ApplicationController } from "./controller/application.controller";
export const Entities = [
    Policy,
    User,
    Application,
    ChaveAcesso,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities
        ]),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60s' },
        }),
    ],
    controllers: [
        AuthController,
        ApplicationController,
    ],
    providers: [
        UserService,
        CredencialService,
        ApplicationService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    exports: [
        UserService,
    ]
})
export class AuthModule { }
export {
    UserService,
    CredencialService,
    ApplicationService,
}